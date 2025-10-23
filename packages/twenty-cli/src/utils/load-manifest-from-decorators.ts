import {
  sys,
  getDecorators,
  readConfigFile,
  parseJsonConfigFileContent,
  formatDiagnosticsWithColorAndContext,
  createProgram,
  Decorator,
  isPropertyAccessExpression,
  isNumericLiteral,
  SyntaxKind,
  isArrayLiteralExpression,
  Expression,
  isPropertyAssignment,
  isComputedPropertyName,
  isStringLiteralLike,
  isShorthandPropertyAssignment,
  isIdentifier,
  Program,
  Node,
  isClassDeclaration,
  isCallExpression,
  isObjectLiteralExpression,
  forEachChild,
} from 'typescript';
import { AppManifest, ObjectManifest } from '../types/config.types';

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue };

const getProgramFromTsconfig = (tsconfigPath = 'tsconfig.json') => {
  const basePath = process.cwd();
  const configFile = readConfigFile(tsconfigPath, sys.readFile);
  if (configFile.error)
    throw new Error(
      formatDiagnosticsWithColorAndContext([configFile.error], {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: sys.getCurrentDirectory,
        getNewLine: () => sys.newLine,
      }),
    );
  const parsed = parseJsonConfigFileContent(configFile.config, sys, basePath);
  if (parsed.errors.length) {
    throw new Error(
      formatDiagnosticsWithColorAndContext(parsed.errors, {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: sys.getCurrentDirectory,
        getNewLine: () => sys.newLine,
      }),
    );
  }
  return createProgram(parsed.fileNames, parsed.options);
};

const isDecoratorNamed = (node: Decorator, name: string): node is Decorator => {
  const expr = node.expression;
  if (isCallExpression(expr)) {
    if (isIdentifier(expr.expression)) return expr.expression.text === name;
    if (isPropertyAccessExpression(expr.expression))
      return expr.expression.name.text === name;
  }
  return false;
};

const exprToValue = (expr: Expression): JSONValue => {
  if (isStringLiteralLike(expr)) return expr.text;
  if (isNumericLiteral(expr)) return Number(expr.text);
  if (expr.kind === SyntaxKind.TrueKeyword) return true;
  if (expr.kind === SyntaxKind.FalseKeyword) return false;
  if (expr.kind === SyntaxKind.NullKeyword) return null;

  if (isArrayLiteralExpression(expr)) {
    return expr.elements.map((e) =>
      e.kind === SyntaxKind.SpreadElement ? [] : exprToValue(e),
    );
  }

  if (isObjectLiteralExpression(expr)) {
    const obj: Record<string, JSONValue> = {};
    for (const prop of expr.properties) {
      if (isPropertyAssignment(prop)) {
        const key =
          isIdentifier(prop.name) || isStringLiteralLike(prop.name)
            ? prop.name.text
            : isComputedPropertyName(prop.name) &&
                isStringLiteralLike(prop.name.expression)
              ? prop.name.expression.text
              : undefined;
        if (key) obj[key] = exprToValue(prop.initializer);
      } else if (isShorthandPropertyAssignment(prop)) {
        // Unsupported without a checker; skip to keep it "light".
        // Could resolve via typechecker if needed.
      }
      // getters/setters/methods are ignored intentionally
    }
    return obj;
  }

  // Keep it intentionally strict/lightweight: anything non-literal becomes a string fallback.
  // You can throw instead if you prefer to fail fast.
  return isIdentifier(expr)
    ? expr.text
    : String((expr as any).getText?.() ?? '');
};

const collectObjects = (program: Program) => {
  const manifest: ObjectManifest[] = [];

  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile) {
      continue;
    }

    const visit = (node: Node) => {
      if (isClassDeclaration(node) && getDecorators(node)?.length) {
        const decorators = getDecorators(node);
        const objectDec = decorators?.find((d) =>
          isDecoratorNamed(d, 'ObjectMetadata'),
        );
        if (objectDec && isCallExpression(objectDec.expression)) {
          const [firstArg] = objectDec.expression.arguments;
          if (firstArg && isObjectLiteralExpression(firstArg)) {
            const config = exprToValue(firstArg);
            if (
              config &&
              typeof config === 'object' &&
              !Array.isArray(config)
            ) {
              manifest.push({
                ...config,
              } as ObjectManifest);
            }
          }
        }
      }
      forEachChild(node, visit);
    };

    visit(sf);
  }

  return manifest;
};

const validateProgram = (program: Program) => {
  const diagnostics = [
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...program.getGlobalDiagnostics(),
  ];

  if (diagnostics.length > 0) {
    const formatted = formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: sys.getCurrentDirectory,
      getNewLine: () => sys.newLine,
    });
    throw new Error(`TypeScript validation failed:\n${formatted}`);
  }
};

export const loadManifestFromDecorators = (): Pick<AppManifest, 'objects'> => {
  const program = getProgramFromTsconfig('tsconfig.json');

  validateProgram(program);

  const objects = collectObjects(program);

  return { objects };
};
