import { type FrontComponentFramework } from 'twenty-shared/application';

const DEFINE_FRONT_COMPONENT_IMPORT_PATTERN =
  /import\s*\{\s*defineFrontComponent\s*\}\s*from\s*['"][^'"]+['"];?\n?/g;

const DEFINE_FRONT_COMPONENT_EXPORT_PATTERN =
  /export\s+default\s+defineFrontComponent\s*\(\s*\{[^}]*component\s*:\s*(\w+)[^}]*\}\s*\)\s*;?/s;

const FRAMEWORK_PATTERN = /framework\s*:\s*['"](\w+)['"]/;

const extractFramework = (sourceCode: string): FrontComponentFramework => {
  const match = sourceCode.match(FRAMEWORK_PATTERN);

  return (match?.[1] as FrontComponentFramework) ?? 'react';
};

const REACT_MOUNT_IMPORTS =
  `import { createRoot as __createRoot } from 'react-dom/client';\n` +
  `import { jsx as __frontComponentJsx } from 'react/jsx-runtime';\n`;

const generateRenderExport = (
  framework: FrontComponentFramework,
  componentName: string,
): string => {
  if (framework === 'react') {
    return `export default function __renderFrontComponent(__container) { __createRoot(__container).render(__frontComponentJsx(${componentName}, {})); }`;
  }

  return `export default function __renderFrontComponent(__container) { ${componentName}(__container); }`;
};

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
    const framework = extractFramework(sourceCode);

    const exportedComponentDeclarationPattern = new RegExp(
      `export\\s+(const|function)\\s+${wrappedComponentName}\\b`,
    );

    transformedSource = transformedSource.replace(
      exportedComponentDeclarationPattern,
      `$1 ${wrappedComponentName}`,
    );

    if (framework === 'react') {
      transformedSource = REACT_MOUNT_IMPORTS + transformedSource;
    }

    transformedSource = transformedSource.replace(
      DEFINE_FRONT_COMPONENT_EXPORT_PATTERN,
      generateRenderExport(framework, wrappedComponentName),
    );
  }

  return transformedSource;
};
