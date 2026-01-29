import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { HTML_TAG_TO_REMOTE_COMPONENT } from 'twenty-shared/front-component-constants';

const REMOTE_COMPONENTS_GLOBAL_NAMESPACE = 'RemoteComponents';

const REACT_JSX_RUNTIME_IMPORT_PATTERN =
  /import\s*\{([^}]+)\}\s*from\s*['"]react\/jsx-runtime['"];?/g;

const REACT_NAMED_IMPORT_PATTERN =
  /import\s*\{([^}]+)\}\s*from\s*['"]react['"];?/g;

type ParsedImportSpecifier = {
  originalName: string;
  aliasName: string;
};

const parseImportSpecifier = (
  importSpecifier: string,
): ParsedImportSpecifier => {
  const trimmedSpecifier = importSpecifier.trim();
  const aliasMatch = trimmedSpecifier.match(/^(\w+)\s+as\s+(\w+)$/);

  if (aliasMatch) {
    return { originalName: aliasMatch[1], aliasName: aliasMatch[2] };
  }

  return { originalName: trimmedSpecifier, aliasName: trimmedSpecifier };
};

const replaceReactImportsWithGlobalThisAssignments = (
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

const buildHtmlTagToRemoteComponentPattern = (): RegExp => {
  const supportedHtmlTagNames = Object.keys(HTML_TAG_TO_REMOTE_COMPONENT).join(
    '|',
  );
  return new RegExp(
    `(<\\/?)\\b(${supportedHtmlTagNames})\\b(?=[\\s>\\/>])`,
    'g',
  );
};

const HTML_TAG_TO_REMOTE_COMPONENT_PATTERN =
  buildHtmlTagToRemoteComponentPattern();

const DEFINE_FRONT_COMPONENT_IMPORT_PATTERN =
  /import\s*\{\s*defineFrontComponent\s*\}\s*from\s*['"][^'"]+['"];?\n?/g;

const DEFINE_FRONT_COMPONENT_EXPORT_PATTERN =
  /export\s+default\s+defineFrontComponent\s*\(\s*\{[^}]*component\s*:\s*(\w+)[^}]*\}\s*\)\s*;?/s;

const replaceHtmlTagsWithRemoteComponents = (sourceCode: string): string => {
  return sourceCode.replace(
    HTML_TAG_TO_REMOTE_COMPONENT_PATTERN,
    (fullMatch, tagPrefix: string, htmlTagName: string) => {
      const remoteComponentName =
        HTML_TAG_TO_REMOTE_COMPONENT[
          htmlTagName as keyof typeof HTML_TAG_TO_REMOTE_COMPONENT
        ];

      if (remoteComponentName) {
        return `${tagPrefix}${REMOTE_COMPONENTS_GLOBAL_NAMESPACE}.${remoteComponentName}`;
      }

      return fullMatch;
    },
  );
};

const unwrapDefineFrontComponentToDirectExport = (
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

const applyFrontComponentTransformationsForRemoteWorker = async (
  sourceFilePath: string,
  sourceCode: string,
): Promise<string> => {
  const sourceWithRemoteComponents =
    replaceHtmlTagsWithRemoteComponents(sourceCode);
  const sourceWithUnwrappedFrontComponent =
    unwrapDefineFrontComponentToDirectExport(sourceWithRemoteComponents);

  const esbuildTransformResult = await esbuild.transform(
    sourceWithUnwrappedFrontComponent,
    {
      loader: 'tsx',
      jsx: 'automatic',
      sourcefile: sourceFilePath,
    },
  );

  const sourceWithGlobalThisReactImports =
    replaceReactImportsWithGlobalThisAssignments(esbuildTransformResult.code);

  return `var RemoteComponents = globalThis.RemoteComponents;\n${sourceWithGlobalThisReactImports}`;
};

export const jsxTransformPluginToRemoteDomWorkerFormat: esbuild.Plugin = {
  name: 'jsx-transform-plugin-to-remote-dom-worker-format',
  setup: (esbuildBuild) => {
    esbuildBuild.onLoad(
      { filter: /\.front-component\.tsx$/ },
      async (loadArgs): Promise<esbuild.OnLoadResult> => {
        try {
          const frontComponentSourceCode = fs.readFileSync(
            loadArgs.path,
            'utf8',
          );
          const transformedContents =
            await applyFrontComponentTransformationsForRemoteWorker(
              loadArgs.path,
              frontComponentSourceCode,
            );

          return { contents: transformedContents, loader: 'js' };
        } catch (transformError) {
          return {
            errors: [
              {
                text: `Failed to transform front component: ${transformError instanceof Error ? transformError.message : String(transformError)}`,
                location: { file: loadArgs.path },
              },
            ],
          };
        }
      },
    );
  },
};
