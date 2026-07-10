const DEFINE_FRONT_COMPONENT_IMPORT_PATTERN =
  /import\s*\{\s*defineFrontComponent\s*\}\s*from\s*['"][^'"]+['"];?\n?/g;

const DEFINE_FRONT_COMPONENT_EXPORT_OPENING_PATTERN =
  /export\s+default\s+defineFrontComponent\s*\(/;

const IDENTIFIER_COMPONENT_VALUE_PATTERN =
  /component\s*:\s*([A-Za-z_$][\w$]*)\s*[,}]/;

const FRONT_COMPONENT_DEFINITION_NAME = '__frontComponentDefinition';

export const unwrapDefineFrontComponentToDirectExport = (
  sourceCode: string,
): string => {
  let transformedSource = sourceCode.replace(
    DEFINE_FRONT_COMPONENT_IMPORT_PATTERN,
    '',
  );

  if (!DEFINE_FRONT_COMPONENT_EXPORT_OPENING_PATTERN.test(transformedSource)) {
    return transformedSource;
  }

  transformedSource = transformedSource.replace(
    DEFINE_FRONT_COMPONENT_EXPORT_OPENING_PATTERN,
    `const ${FRONT_COMPONENT_DEFINITION_NAME} = (`,
  );

  const identifierComponentMatch = transformedSource.match(
    IDENTIFIER_COMPONENT_VALUE_PATTERN,
  );

  if (identifierComponentMatch) {
    const wrappedComponentName = identifierComponentMatch[1];

    transformedSource = transformedSource.replace(
      new RegExp(`export\\s+(const|function)\\s+${wrappedComponentName}\\b`),
      `$1 ${wrappedComponentName}`,
    );
  }

  return (
    `import { createRoot as __createRoot } from 'react-dom/client';\n` +
    `import { jsx as __frontComponentJsx } from 'react/jsx-runtime';\n` +
    transformedSource +
    `\nexport default function __renderFrontComponent(__container) { __createRoot(__container).render(__frontComponentJsx(${FRONT_COMPONENT_DEFINITION_NAME}.component, {})); }\n`
  );
};
