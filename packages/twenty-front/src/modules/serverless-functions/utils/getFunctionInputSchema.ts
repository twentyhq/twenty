import {
  ArrayTypeNode,
  ArrowFunction,
  createSourceFile,
  FunctionDeclaration,
  LiteralTypeNode,
  PropertySignature,
  ScriptTarget,
  StringLiteral,
  SyntaxKind,
  TypeNode,
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
      const properties: InputSchema = {};

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

export const getFunctionInputSchema = (fileContent: string): InputSchema => {
  const sourceFile = createSourceFile(
    'temp.ts',
    fileContent,
    ScriptTarget.ESNext,
    true,
  );

  const schema: InputSchema = {};

  sourceFile.forEachChild((node) => {
    if (node.kind === SyntaxKind.FunctionDeclaration) {
      const funcNode = node as FunctionDeclaration;
      const params = funcNode.parameters;

      params.forEach((param) => {
        const paramName = param.name.getText();
        const typeNode = param.type;

        if (isDefined(typeNode)) {
          schema[paramName] = getTypeString(typeNode);
        } else {
          schema[paramName] = { type: 'unknown' };
        }
      });
    } else if (node.kind === SyntaxKind.VariableStatement) {
      const varStatement = node as VariableStatement;

      varStatement.declarationList.declarations.forEach((declaration) => {
        if (
          isDefined(declaration.initializer) &&
          declaration.initializer.kind === SyntaxKind.ArrowFunction
        ) {
          const arrowFunction = declaration.initializer as ArrowFunction;
          const params = arrowFunction.parameters;

          params.forEach((param: any) => {
            const paramName = param.name.text;
            const typeNode = param.type;

            if (isDefined(typeNode)) {
              schema[paramName] = getTypeString(typeNode);
            } else {
              schema[paramName] = { type: 'unknown' };
            }
          });
        }
      });
    }
  });

  return schema;
};
