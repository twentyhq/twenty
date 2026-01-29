import { REACT_JSX_RUNTIME_IMPORT_PATTERN } from '../constants/ReactJsxRuntimeImportPattern';
import { REACT_NAMED_IMPORT_PATTERN } from '../constants/ReactNamedImportPattern';
import { extractNamesFromImportSpecifier } from './extract-names-from-import-specifier';

export const replaceReactImportsWithGlobalThisAssignments = (
  sourceCode: string,
): string => {
  let transformedSource = sourceCode.replace(
    REACT_JSX_RUNTIME_IMPORT_PATTERN,
    (_match, importSpecifiers: string) => {
      const parsedImportSpecifiers = importSpecifiers
        .split(',')
        .map(extractNamesFromImportSpecifier);

      const globalThisAssignments = parsedImportSpecifiers
        .map(({ originalName, aliasName }) => {
          switch (originalName) {
            case 'jsx':
            case 'jsxs':
              return `var ${aliasName} = globalThis.${originalName};`;
            case 'Fragment':
              return `var ${aliasName} = globalThis.React.Fragment;`;
            default:
              return `var ${aliasName} = globalThis.React.${originalName};`;
          }
        })
        .join('\n');

      return globalThisAssignments;
    },
  );

  transformedSource = transformedSource.replace(
    REACT_NAMED_IMPORT_PATTERN,
    (_match, importSpecifiers: string) => {
      const parsedImportSpecifiers = importSpecifiers
        .split(',')
        .map(extractNamesFromImportSpecifier);

      const globalThisAssignments = parsedImportSpecifiers
        .map(
          ({ originalName, aliasName }) =>
            `var ${aliasName} = globalThis.React.${originalName};`,
        )
        .join('\n');

      return globalThisAssignments;
    },
  );

  return transformedSource;
};
