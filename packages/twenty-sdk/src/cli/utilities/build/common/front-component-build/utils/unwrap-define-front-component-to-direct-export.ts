import { DEFINE_FRONT_COMPONENT_EXPORT_PATTERN } from '../constants/DefineFrontComponentExportPattern';
import { DEFINE_FRONT_COMPONENT_IMPORT_PATTERN } from '../constants/DefineFrontComponentImportPattern';

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

    transformedSource = transformedSource.replace(
      DEFINE_FRONT_COMPONENT_EXPORT_PATTERN,
      `export default globalThis.jsx(${wrappedComponentName}, {});`,
    );
  }

  return transformedSource;
};
