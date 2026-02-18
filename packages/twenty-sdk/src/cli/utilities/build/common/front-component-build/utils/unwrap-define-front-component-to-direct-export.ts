import { Node, Project, type SourceFile, ts } from 'ts-morph';

const project = new Project({
  useInMemoryFileSystem: true,
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
});

const removeDefineFrontComponentFromImports = (
  sourceFile: SourceFile,
): void => {
  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    const defineFrontComponentSpecifier = importDeclaration
      .getNamedImports()
      .find((specifier) => specifier.getName() === 'defineFrontComponent');

    if (!defineFrontComponentSpecifier) {
      continue;
    }

    defineFrontComponentSpecifier.remove();

    if (importDeclaration.getNamedImports().length === 0) {
      importDeclaration.remove();
    }
  }
};

const extractComponentNameFromDefaultExport = (
  sourceFile: SourceFile,
): string | null => {
  for (const statement of sourceFile.getStatements()) {
    if (!Node.isExportAssignment(statement) || statement.isExportEquals()) {
      continue;
    }

    const expression = statement.getExpression();

    if (
      !Node.isCallExpression(expression) ||
      expression.getExpression().getText() !== 'defineFrontComponent'
    ) {
      continue;
    }

    const [configArg] = expression.getArguments();

    if (!configArg || !Node.isObjectLiteralExpression(configArg)) {
      throw new Error(
        'defineFrontComponent must be called with an object literal argument',
      );
    }

    const componentProperty = configArg.getProperty('component');

    if (!componentProperty) {
      throw new Error(
        'defineFrontComponent config must include a "component" property',
      );
    }

    if (Node.isShorthandPropertyAssignment(componentProperty)) {
      return componentProperty.getName();
    }

    if (!Node.isPropertyAssignment(componentProperty)) {
      throw new Error(
        'Unexpected syntax for "component" property in defineFrontComponent config',
      );
    }

    const initializer = componentProperty.getInitializer();

    if (!initializer) {
      throw new Error('"component" property must have a value');
    }

    return initializer.getText();
  }

  return null;
};

const removeExportFromComponentDeclaration = (
  sourceFile: SourceFile,
  componentName: string,
): void => {
  for (const statement of sourceFile.getStatements()) {
    if (
      Node.isVariableStatement(statement) &&
      statement.isExported() &&
      statement
        .getDeclarationList()
        .getDeclarations()
        .some((declaration) => declaration.getName() === componentName)
    ) {
      statement.setIsExported(false);

      return;
    }

    if (
      Node.isFunctionDeclaration(statement) &&
      statement.isExported() &&
      !statement.isDefaultExport() &&
      statement.getName() === componentName
    ) {
      statement.setIsExported(false);

      return;
    }
  }
};

const replaceDefaultExportWithRenderFunction = (
  sourceFile: SourceFile,
  componentName: string,
): void => {
  for (const statement of sourceFile.getStatements()) {
    if (!Node.isExportAssignment(statement) || statement.isExportEquals()) {
      continue;
    }

    statement.replaceWithText(
      `export default function __renderFrontComponent(__container) {` +
        ` __createRoot(__container).render(` +
        `__frontComponentJsx(${componentName}, {})); }`,
    );

    return;
  }
};

export const unwrapDefineFrontComponentToDirectExport = (
  sourceCode: string,
): string => {
  const existingFile = project.getSourceFile('component.tsx');

  if (existingFile) {
    project.removeSourceFile(existingFile);
  }

  const sourceFile = project.createSourceFile('component.tsx', sourceCode);

  const componentName = extractComponentNameFromDefaultExport(sourceFile);

  if (!componentName) {
    return sourceCode;
  }

  removeDefineFrontComponentFromImports(sourceFile);
  removeExportFromComponentDeclaration(sourceFile, componentName);
  replaceDefaultExportWithRenderFunction(sourceFile, componentName);

  sourceFile.insertStatements(0, [
    `import { createRoot as __createRoot } from 'react-dom/client';`,
    `import { jsx as __frontComponentJsx } from 'react/jsx-runtime';`,
  ]);

  return sourceFile.getFullText();
};
