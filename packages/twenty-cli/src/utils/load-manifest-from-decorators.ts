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
  SourceFile,
  isPropertyDeclaration,
  isArrowFunction,
  isMethodDeclaration,
  isVariableStatement,
  isNewExpression,
} from 'typescript';
import kebabCase from 'lodash.kebabcase';
import {
  AppManifest,
  CronTrigger,
  DatabaseEventTrigger,
  HTTPMethod,
  ObjectManifest,
  RouteTrigger,
  ServerlessFunctionManifest,
} from '../types/config.types';
import { posix, relative, sep } from 'path';

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

const getFirstArgObject = (dec: Decorator) => {
  if (!isCallExpression(dec.expression)) return undefined;
  const [firstArg] = dec.expression.arguments;
  return firstArg && isObjectLiteralExpression(firstArg)
    ? (exprToValue(firstArg) as Record<string, JSONValue>)
    : undefined;
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
        if (objectDec) {
          const cfg = getFirstArgObject(objectDec);
          if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) {
            manifest.push({ ...(cfg as any) } as ObjectManifest);
          }
        }
      }
      forEachChild(node, visit);
    };

    visit(sf);
  }

  return manifest;
};

/**
 * Finds: `export const <handlerName> = new <ClassName>().main;`
 * Returns the exported const identifier (handlerName) or undefined.
 */
const findExportedHandlerNameForClass = (
  sf: SourceFile,
  className: string,
): string | undefined => {
  for (const st of sf.statements) {
    if (!isVariableStatement(st)) continue;

    const hasExport =
      st.modifiers?.some((m) => m.kind === SyntaxKind.ExportKeyword) ?? false;
    if (!hasExport) continue;

    for (const decl of st.declarationList.declarations) {
      if (!isIdentifier(decl.name) || !decl.initializer) continue;

      // Expect initializer like: new CreateNewPostCard().main
      const init = decl.initializer;

      if (isPropertyAccessExpression(init) && init.name.text === 'main') {
        const expr = init.expression;
        if (
          isNewExpression(expr) &&
          expr.expression &&
          isIdentifier(expr.expression)
        ) {
          if (expr.expression.text === className) {
            return decl.name.text;
          }
        }
      }
    }
  }
  return undefined;
};

const posixRelativeFromCwd = (absPath: string) => {
  const rel = relative(process.cwd(), absPath);
  // normalize to posix separators for portability / manifest stability
  return rel.split(sep).join(posix.sep);
};

const collectServerlessFunctions = (program: Program) => {
  const items: ServerlessFunctionManifest[] = [];

  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile) {
      continue;
    }

    const visit = (node: Node) => {
      if (!isClassDeclaration(node) || !getDecorators(node)?.length) {
        forEachChild(node, visit);
        return;
      }

      const decorators = getDecorators(node) ?? [];

      const sfnDec = decorators.find((d) =>
        isDecoratorNamed(d, 'ServerlessFunction'),
      );
      if (!sfnDec) {
        forEachChild(node, visit);
        return;
      }

      const className = node.name?.escapedText ?? 'serverless-function';
      const kebabName = kebabCase(className);
      const sfnCfg = getFirstArgObject(sfnDec) ?? {};
      const sfnUuid = String(sfnCfg.universalIdentifier ?? '');

      // CronTrigger
      const cronTrigDecs = decorators.filter((d) =>
        isDecoratorNamed(d, 'CronTrigger'),
      );

      const cronTriggers: CronTrigger[] = cronTrigDecs
        .map((d) => getFirstArgObject(d))
        .filter(Boolean)
        .map((cfg) => ({
          universalIdentifier: String(cfg!.universalIdentifier ?? ''),
          type: 'cron',
          pattern: String(cfg!.pattern ?? ''),
        }));

      // DatabaseEventTrigger
      const dbTrigDecs = decorators.filter((d) =>
        isDecoratorNamed(d, 'DatabaseEventTrigger'),
      );
      const dbTriggers: DatabaseEventTrigger[] = dbTrigDecs
        .map((d) => getFirstArgObject(d))
        .filter(Boolean)
        .map((cfg) => ({
          universalIdentifier: String(cfg!.universalIdentifier ?? ''),
          type: 'databaseEvent',
          eventName: String(cfg!.eventName ?? ''),
        }));

      // RouteTrigger
      const routeTrigDecs = decorators.filter((d) =>
        isDecoratorNamed(d, 'RouteTrigger'),
      );
      const routeTriggers: RouteTrigger[] = routeTrigDecs
        .map((d) => getFirstArgObject(d))
        .filter(Boolean)
        .map((cfg) => ({
          universalIdentifier: String(cfg!.universalIdentifier ?? ''),
          type: 'route',
          path: String(cfg!.path ?? ''),
          httpMethod: String(cfg!.httpMethod ?? ''),
          isAuthRequired:
            typeof cfg!.isAuthRequired === 'boolean'
              ? (cfg!.isAuthRequired as boolean)
              : false,
        }));

      const handlerPath = posixRelativeFromCwd(sf.fileName);

      const handlerName = findExportedHandlerNameForClass(sf, className) ?? ''; // empty string if not found

      items.push({
        universalIdentifier: sfnUuid,
        name: kebabName,
        triggers: [...cronTriggers, ...dbTriggers, ...routeTriggers],
        handlerPath,
        handlerName,
        code: { src: { 'index.ts': '' } }, // added after
      });

      forEachChild(node, visit);
    };

    visit(sf);
  }

  return items;
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

export const loadManifestFromDecorators = (): Pick<
  AppManifest,
  'objects' | 'serverlessFunctions'
> => {
  const program = getProgramFromTsconfig('tsconfig.json');

  validateProgram(program);

  const objects = collectObjects(program);

  const serverlessFunctions = collectServerlessFunctions(program);

  return { objects, serverlessFunctions };
};
