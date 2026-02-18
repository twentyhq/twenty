const DEFINE_FRONT_COMPONENT_IMPORT_PATTERN =
  /import\s*\{\s*defineFrontComponent\s*\}\s*from\s*['"][^'"]+['"];?\n?/g;

const DEFINE_FRONT_COMPONENT_EXPORT_PATTERN =
  /export\s+default\s+defineFrontComponent\s*\(\s*\{[^}]*component\s*:\s*(\w+)[^}]*\}\s*\)\s*;?/s;

export const unwrapDefineFrontComponentToDirectExport = (
  sourceCode: string,
): string => {
  let transformedSource = sourceCode.replace(
    DEFINE_FRONT_COMPONENT_IMPORT_PATTERN,
    '',
  );

  const defineFrontComponentMatch = transformedSource.match(
    DEFINE_FRONT_COMPONENT_EXPORT_PATTERN,
  );

  if (defineFrontComponentMatch) {
    const wrappedComponentName = defineFrontComponentMatch[1];

    const exportedComponentDeclarationPattern = new RegExp(
      `export\\s+(const|function)\\s+${wrappedComponentName}\\b`,
    );

    transformedSource = transformedSource.replace(
      exportedComponentDeclarationPattern,
      `$1 ${wrappedComponentName}`,
    );

    transformedSource =
      `import { createRoot as __createRoot } from 'react-dom/client';\n` +
      `import { jsx as __frontComponentJsx } from 'react/jsx-runtime';\n` +
      transformedSource;

    transformedSource = transformedSource.replace(
      DEFINE_FRONT_COMPONENT_EXPORT_PATTERN,
      `export default function __renderFrontComponent(__container) { __createRoot(__container).render(__frontComponentJsx(${wrappedComponentName}, {})); }`,
    );
  }

  return transformedSource;
};
