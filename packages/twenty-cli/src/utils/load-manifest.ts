import * as fs from 'fs-extra';
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
  FunctionDeclaration,
  VariableDeclaration,
  Program,
  Node,
  isClassDeclaration,
  isCallExpression,
  isObjectLiteralExpression,
  forEachChild,
  SourceFile,
  isVariableStatement,
  isArrowFunction,
  isFunctionExpression,
  isExportAssignment,
  Modifier,
  isPropertyDeclaration,
  isNoSubstitutionTemplateLiteral,
  isTemplateExpression,
} from 'typescript';
import {
  AppManifest,
  Application,
  ObjectManifest,
  PackageJson,
  ServerlessFunctionManifest,
  Sources,
  FieldMetadata,
} from '../types/config.types';
import { posix, relative, sep, resolve, join } from 'path';
import { parseJsoncFile, parseTextFile } from '../utils/jsonc-parser';
import { findPathFile } from '../utils/find-path-file';

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue };

const getProgramFromTsconfig = (
  appPath?: string,
  tsconfigPath = 'tsconfig.json',
) => {
  const basePath = appPath ?? process.cwd();
  const configFile = readConfigFile(join(basePath, tsconfigPath), sys.readFile);
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

  if (isPropertyAccessExpression(expr)) {
    if (isIdentifier(expr.expression) && isIdentifier(expr.name)) {
      return expr.name.text;
    }
    return String(expr.getText());
  }

  if (isNoSubstitutionTemplateLiteral(expr)) {
    return expr.text;
  }
  if (isTemplateExpression(expr)) {
    let out = expr.head.text;
    for (const span of expr.templateSpans) {
      const v = exprToValue(span.expression);
      out += String(v) + span.literal.text;
    }
    return out;
  }

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
            const fields: Array<Record<string, JSONValue>> = [];

            for (const member of node.members) {
              if (!isPropertyDeclaration(member)) {
                continue;
              }

              const fieldDec = getDecorators(member)?.find((d) =>
                isDecoratorNamed(d, 'FieldMetadata'),
              );

              if (!fieldDec) {
                continue;
              }

              const fieldCfg = getFirstArgObject(fieldDec);

              if (!fieldCfg) {
                continue;
              }

              // Try to attach the TypeScript property name as "name"
              let name: string | undefined;
              if (member.name && isIdentifier(member.name)) {
                name = member.name.text;
              } else {
                // fallback to AST text if not a simple identifier
                name = member.name?.getText?.() ?? undefined;
              }

              fields.push({
                ...(fieldCfg as FieldMetadata),
                ...(name ? { name } : {}),
              });
            }
            manifest.push({ ...(cfg as any), fields } as ObjectManifest);
          }
        }
      }
      forEachChild(node, visit);
    };

    visit(sf);
  }

  return manifest;
};

// Add if you want a small guard for "export" presence on statements
const hasExportModifier = (st: any) =>
  st.modifiers?.some((m: Modifier) => m.kind === SyntaxKind.ExportKeyword) ??
  false;

/**
 * Finds (and validates) the new serverless file shape:
 * - exactly 2 exported bindings
 * - one must be `config` (typed ServerlessFunctionConfig)
 * - the other must be a function (exported function declaration, or const initialized with arrow/function expression)
 */
const findHandlerAndConfig = (
  sf: SourceFile,
): {
  handlerName: ServerlessFunctionManifest['handlerName'];
  configObject: Pick<
    ServerlessFunctionManifest,
    | 'universalIdentifier'
    | 'name'
    | 'description'
    | 'timeoutSeconds'
    | 'triggers'
  >;
} => {
  type Exported = {
    name: string;
    kind: 'function' | 'const';
    init?: Expression;
    declNode: Node;
  };

  const exported: Exported[] = [];

  // 1) export const X = <arrow|function expr>
  for (const st of sf.statements) {
    if (!isVariableStatement(st) || !hasExportModifier(st)) continue;

    for (const decl of st.declarationList.declarations) {
      if (!isIdentifier(decl.name)) continue;

      const name = decl.name.text;
      const init = decl.initializer ?? undefined;

      exported.push({
        name,
        kind: 'const',
        init,
        declNode: decl,
      });
    }
  }

  // 2) export function X() { ... }
  for (const st of sf.statements) {
    if (st.kind === SyntaxKind.FunctionDeclaration && hasExportModifier(st)) {
      const fd = st as FunctionDeclaration;
      if (fd.name && isIdentifier(fd.name)) {
        exported.push({
          name: fd.name.text,
          kind: 'function',
          init: undefined,
          declNode: fd,
        });
      }
    }
  }

  // Enforce exactly two exports
  const unique = Array.from(new Map(exported.map((e) => [e.name, e])).values());
  if (unique.length !== 2) {
    throw new Error(
      `Serverless file ${sf.fileName} must export exactly 2 bindings (handler + config). Found: ${unique.map((e) => e.name).join(', ')}`,
    );
  }

  // Find config
  const configExport = unique.find((e) => e.name === 'config');
  if (!configExport) {
    throw new Error(
      `Serverless file ${sf.fileName} must export a binding named "config".`,
    );
  }
  // Must be initialized to an object literal
  if (!configExport.init || !isObjectLiteralExpression(configExport.init)) {
    throw new Error(
      `"config" in ${sf.fileName} must be initialized to an object literal.`,
    );
  }
  // (Light) type guard: ensure declared type mentions ServerlessFunctionConfig if present
  const maybeVarDecl = configExport.declNode as VariableDeclaration;
  if ('type' in maybeVarDecl && maybeVarDecl.type) {
    const typeText = maybeVarDecl.type.getText(sf);
    if (!/\bServerlessFunctionConfig\b/.test(typeText)) {
      throw new Error(
        `"config" in ${sf.fileName} must be typed as ServerlessFunctionConfig (got: ${typeText}).`,
      );
    }
  }

  const configObject = exprToValue(configExport.init) as Pick<
    ServerlessFunctionManifest,
    | 'universalIdentifier'
    | 'name'
    | 'description'
    | 'timeoutSeconds'
    | 'triggers'
  >;

  // Identify the handler: the other export
  const handlerExport = unique.find((e) => e.name !== 'config');
  if (!handlerExport) {
    throw new Error(`Could not find the handler export in ${sf.fileName}.`);
  }

  // If it's a const, make sure it’s a function-ish initializer
  if (handlerExport.kind === 'const') {
    const init = handlerExport.init;
    const isFuncLike =
      !!init && (isArrowFunction(init) || isFunctionExpression(init));
    if (!isFuncLike) {
      throw new Error(
        `Handler "${handlerExport.name}" in ${sf.fileName} must be a function (arrow or function expression).`,
      );
    }
  }

  return {
    handlerName: handlerExport.name,
    configObject,
  };
};

const posixRelativeFromCwd = (absPath: string) => {
  const rel = relative(process.cwd(), absPath);
  // normalize to posix separators for portability / manifest stability
  return rel.split(sep).join(posix.sep);
};

const collectServerlessFunctions = (program: Program) => {
  const serverlessFunctions: ServerlessFunctionManifest[] = [];

  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile) continue;

    try {
      const { handlerName, configObject } = findHandlerAndConfig(sf);

      const handlerPath = posixRelativeFromCwd(sf.fileName);

      serverlessFunctions.push({
        ...configObject,
        handlerPath,
        handlerName,
      });
    } catch {
      // Not a serverless file under the new format — ignore and continue scanning.
      continue;
    }
  }

  return serverlessFunctions;
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

const setNested = (root: Sources, parts: string[], value: string) => {
  let cur: Sources = root;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    if (i === parts.length - 1) {
      cur[key] = value;
    } else {
      cur[key] = (cur[key] ?? {}) as Sources;
      cur = cur[key] as Sources;
    }
  }
};

const loadFolderContentIntoJson = async (
  sourcePath = '.',
  tsconfigPath = 'tsconfig.json',
): Promise<Sources> => {
  const sources: Sources = {};
  const baseAbs = resolve(sourcePath);

  // Build the program from tsconfig (uses your getProgramFromTsconfig)
  const program: Program = getProgramFromTsconfig(baseAbs, tsconfigPath);

  // Iterate only files the TS program knows about.
  for (const sf of program.getSourceFiles()) {
    const abs = sf.fileName;

    // Skip .d.ts and anything outside sourcePath
    if (sf.isDeclarationFile) continue;
    if (!abs.startsWith(baseAbs + sep) && abs !== baseAbs) continue;

    // Keep only TS/TSX files
    if (!(abs.endsWith('.ts') || abs.endsWith('.tsx'))) continue;

    // Optional extra guard (usually unnecessary if tsconfig excludes node_modules)
    if (abs.includes(`${sep}node_modules${sep}`)) continue;

    const relFromRoot = relative(baseAbs, abs);
    const parts = relFromRoot.split(sep);

    const content = await fs.readFile(abs, 'utf8');
    setNested(sources, parts, content);
  }

  return sources;
};

export const extractTwentyAppConfig = (program: Program): Application => {
  for (const sf of program.getSourceFiles()) {
    if (sf.isDeclarationFile || !sf.fileName.endsWith('application.config.ts'))
      continue;

    let found: Application | undefined;

    const visit = (node: any): void => {
      // Look for "export default twentyAppConfig"
      if (isExportAssignment(node) && isIdentifier(node.expression)) {
        const varName = node.expression.text;

        // find the corresponding variable declaration
        for (const stmt of sf.statements) {
          if (isVariableStatement(stmt)) {
            for (const decl of stmt.declarationList.declarations) {
              if (isIdentifier(decl.name) && decl.name.text === varName) {
                if (
                  decl.initializer &&
                  isObjectLiteralExpression(decl.initializer)
                ) {
                  found = exprToValue(decl.initializer) as Application;
                }
              }
            }
          }
        }
      }
      if (!found) forEachChild(node, visit);
    };

    visit(sf);

    if (found) return found;
  }

  throw new Error('Could not find default exported ApplicationConfig');
};

export const loadManifest = async (
  path?: string,
): Promise<{
  packageJson: PackageJson;
  yarnLock: string;
  manifest: AppManifest;
}> => {
  const appPath = path ?? process.cwd();

  const packageJson = await parseJsoncFile(
    await findPathFile(appPath, 'package.json'),
  );

  const yarnLock = await parseTextFile(
    await findPathFile(appPath, 'yarn.lock'),
  );

  const program = getProgramFromTsconfig(appPath, 'tsconfig.json');

  validateProgram(program);

  const [objects, serverlessFunctions, application, sources] =
    await Promise.all([
      Promise.resolve(collectObjects(program)),
      Promise.resolve(collectServerlessFunctions(program)),
      Promise.resolve(extractTwentyAppConfig(program)),
      loadFolderContentIntoJson(appPath),
    ]);

  return {
    packageJson,
    yarnLock,
    manifest: {
      application,
      objects,
      serverlessFunctions,
      sources,
    },
  };
};
