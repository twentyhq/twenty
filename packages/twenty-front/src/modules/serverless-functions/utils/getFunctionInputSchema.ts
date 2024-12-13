import {
  ArrayTypeNode,
  ArrowFunction,
  createSourceFile,
  FunctionDeclaration,
  FunctionLikeDeclaration,
  LiteralTypeNode,
  PropertySignature,
  ScriptTarget,
  StringLiteral,
  SyntaxKind,
  TypeNode,
  Node,
  UnionTypeNode,
  VariableStatement,
} from 'typescript';
import { InputSchema, InputSchemaProperty } from '@/workflow/types/InputSchema';
import { isDefined } from 'twenty-ui';

const getTypeString = (typeNode: TypeNode): InputSchemaProperty => {
  switch (typeNode.kind) {
    case SyntaxKind.NumberKeyword:
      return { type: 'number' };
    case SyntaxKind.StringKeyword:
      return { type: 'string' };
    case SyntaxKind.BooleanKeyword:
      return { type: 'boolean' };
    case SyntaxKind.ArrayType:
      return {
        type: 'array',
        items: getTypeString((typeNode as ArrayTypeNode).elementType),
      };
    case SyntaxKind.ObjectKeyword:
      return { type: 'object' };
    case SyntaxKind.TypeLiteral: {
      const properties: InputSchemaProperty['properties'] = {};

      (typeNode as any).members.forEach((member: PropertySignature) => {
        if (isDefined(member.name) && isDefined(member.type)) {
          const memberName = (member.name as any).text;

          properties[memberName] = getTypeString(member.type);
        }
      });

      return { type: 'object', properties };
    }
    case SyntaxKind.UnionType: {
      const unionNode = typeNode as UnionTypeNode;
      const enumValues: string[] = [];

      let isEnum = true;

      unionNode.types.forEach((subType) => {
        if (subType.kind === SyntaxKind.LiteralType) {
          const literal = (subType as LiteralTypeNode).literal;

          if (literal.kind === SyntaxKind.StringLiteral) {
            enumValues.push((literal as StringLiteral).text);
          } else {
            isEnum = false;
          }
        } else {
          isEnum = false;
        }
      });

      if (isEnum) {
        return { type: 'string', enum: enumValues };
      }

      return { type: 'unknown' };
    }
    default:
      return { type: 'unknown' };
  }
};

const computeFunctionParameters = (
  funcNode: FunctionDeclaration | FunctionLikeDeclaration | ArrowFunction,
  schema: InputSchema,
): InputSchema => {
  const params = funcNode.parameters;

  return params.reduce((updatedSchema, param) => {
    const typeNode = param.type;

    if (isDefined(typeNode)) {
      return [...updatedSchema, getTypeString(typeNode)];
    } else {
      return [...updatedSchema, { type: 'unknown' }];
    }
  }, schema);
};

const extractFunctions = (node: Node): FunctionLikeDeclaration[] => {
  if (node.kind === SyntaxKind.FunctionDeclaration) {
    return [node as FunctionDeclaration];
  }

  if (node.kind === SyntaxKind.VariableStatement) {
    const varStatement = node as VariableStatement;
    return varStatement.declarationList.declarations
      .filter(
        (declaration) =>
          isDefined(declaration.initializer) &&
          declaration.initializer.kind === SyntaxKind.ArrowFunction,
      )
      .map((declaration) => declaration.initializer as ArrowFunction);
  }

  return [];
};

export const getFunctionInputSchema = (fileContent: string): InputSchema => {
  const sourceFile = createSourceFile(
    'temp.ts',
    fileContent,
    ScriptTarget.ESNext,
    true,
  );
  let schema: InputSchema = [];

  sourceFile.forEachChild((node) => {
    if (
      node.kind === SyntaxKind.FunctionDeclaration ||
      node.kind === SyntaxKind.VariableStatement
    ) {
      const functions = extractFunctions(node);
      functions.forEach((func) => {
        schema = computeFunctionParameters(func, schema);
      });
    }
  });

  return schema;
};
