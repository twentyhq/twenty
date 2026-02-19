const DEFINE_FRONT_COMPONENT_IMPORT_PATTERN =
  /import\s*\{[^}]*\bdefineFrontComponent\b[^}]*\}\s*from\s*['"][^'"]+['"];?\n?/g;

const removeDefineFrontComponentFromImport = (
  importStatement: string,
): string => {
  const withoutDefineFrontComponent = importStatement.replace(
    /,?\s*\bdefineFrontComponent\b\s*,?/,
    (match) => {
      if (match.startsWith(',') && match.endsWith(',')) {
        return ',';
      }

      return '';
    },
  );

  const remainingImportsMatch = withoutDefineFrontComponent.match(
    /import\s*\{([^}]*)\}\s*from/,
  );

  if (!remainingImportsMatch || remainingImportsMatch[1].trim().length === 0) {
    return '';
  }

  return withoutDefineFrontComponent;
};

const extractComponentNameFromExport = (
  sourceCode: string,
): { fullMatch: string; componentName: string } | null => {
  const exportStart = sourceCode.indexOf('export default defineFrontComponent');

  if (exportStart === -1) {
    return null;
  }

  const parenStart = sourceCode.indexOf('(', exportStart);

  if (parenStart === -1) {
    return null;
  }

  let depth = 0;
  let parenEnd = -1;

  for (let i = parenStart; i < sourceCode.length; i++) {
    if (sourceCode[i] === '(') {
      depth++;
    } else if (sourceCode[i] === ')') {
      depth--;

      if (depth === 0) {
        parenEnd = i;
        break;
      }
    }
  }

  if (parenEnd === -1) {
    return null;
  }

  let endIndex = parenEnd + 1;

  if (sourceCode[endIndex] === ';') {
    endIndex++;
  }

  const fullMatch = sourceCode.slice(exportStart, endIndex);
  const configContent = sourceCode.slice(parenStart + 1, parenEnd);
  const componentMatch = configContent.match(/\bcomponent\s*:\s*(\w+)/);

  if (!componentMatch) {
    return null;
  }

  return { fullMatch, componentName: componentMatch[1] };
};

export const unwrapDefineFrontComponentToDirectExport = (
  sourceCode: string,
): string => {
  let transformedSource = sourceCode.replace(
    DEFINE_FRONT_COMPONENT_IMPORT_PATTERN,
    (match) => removeDefineFrontComponentFromImport(match),
  );

  const extracted = extractComponentNameFromExport(transformedSource);

  if (extracted) {
    const { fullMatch, componentName } = extracted;

    const exportedComponentDeclarationPattern = new RegExp(
      `export\\s+(const|function)\\s+${componentName}\\b`,
    );

    transformedSource = transformedSource.replace(
      exportedComponentDeclarationPattern,
      `$1 ${componentName}`,
    );

    transformedSource =
      `import { createRoot as __createRoot } from 'react-dom/client';\n` +
      `import { jsx as __frontComponentJsx } from 'react/jsx-runtime';\n` +
      transformedSource;

    transformedSource = transformedSource.replace(
      fullMatch,
      `export default function __renderFrontComponent(__container) { __createRoot(__container).render(__frontComponentJsx(${componentName}, {})); }`,
    );
  }

  return transformedSource;
};
