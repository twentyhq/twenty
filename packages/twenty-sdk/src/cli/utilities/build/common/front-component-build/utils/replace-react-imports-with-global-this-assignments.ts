import { REACT_JSX_RUNTIME_IMPORT_PATTERN } from '../constants/ReactJsxRuntimeImportPattern';
import { REACT_NAMED_IMPORT_PATTERN } from '../constants/ReactNamedImportPattern';
import { parseImportSpecifier } from './parse-import-specifier';

export const replaceReactImportsWithGlobalThisAssignments = (
  sourceCode: string,
): string => {
  let transformedSource = sourceCode.replace(
    REACT_JSX_RUNTIME_IMPORT_PATTERN,
    (_match, importSpecifiers: string) => {
      const parsedImportSpecifiers = importSpecifiers
        .split(',')
        .map(parseImportSpecifier);

      const globalThisAssignments = parsedImportSpecifiers
        .map(({ originalName, aliasName }) => {
          if (originalName === 'jsx' || originalName === 'jsxs') {
            return `var ${aliasName} = globalThis.${originalName};`;
          }
          if (originalName === 'Fragment') {
            return `var ${aliasName} = globalThis.React.Fragment;`;
          }
          return `var ${aliasName} = globalThis.React.${originalName};`;
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
        .map(parseImportSpecifier);

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
