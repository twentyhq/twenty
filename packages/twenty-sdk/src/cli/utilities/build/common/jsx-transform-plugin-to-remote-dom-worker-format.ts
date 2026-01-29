import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { HTML_TAG_TO_REMOTE_COMPONENT } from 'twenty-shared/front-component-constants';

const REMOTE_COMPONENTS_PREFIX = 'RemoteComponents';

const REACT_JSX_IMPORT_PATTERN =
  /import\s*\{([^}]+)\}\s*from\s*['"]react\/jsx-runtime['"];?/g;

const REACT_IMPORT_PATTERN = /import\s*\{([^}]+)\}\s*from\s*['"]react['"];?/g;

type ParsedImport = {
  original: string;
  alias: string;
};

const parseImportSpec = (importSpec: string): ParsedImport => {
  const trimmed = importSpec.trim();
  const aliasMatch = trimmed.match(/^(\w+)\s+as\s+(\w+)$/);

  if (aliasMatch) {
    return { original: aliasMatch[1], alias: aliasMatch[2] };
  }

  return { original: trimmed, alias: trimmed };
};

const transformReactImportsToGlobalThis = (source: string): string => {
  let transformed = source.replace(
    REACT_JSX_IMPORT_PATTERN,
    (_match, imports: string) => {
      const parsedImports = imports.split(',').map(parseImportSpec);
      const assignments = parsedImports
        .map(({ original, alias }) => {
          if (original === 'jsx' || original === 'jsxs') {
            return `var ${alias} = globalThis.${original};`;
          }
          if (original === 'Fragment') {
            return `var ${alias} = globalThis.React.Fragment;`;
          }
          return `var ${alias} = globalThis.React.${original};`;
        })
        .join('\n');
      return assignments;
    },
  );

  transformed = transformed.replace(
    REACT_IMPORT_PATTERN,
    (_match, imports: string) => {
      const parsedImports = imports.split(',').map(parseImportSpec);
      const assignments = parsedImports
        .map(
          ({ original, alias }) =>
            `var ${alias} = globalThis.React.${original};`,
        )
        .join('\n');
      return assignments;
    },
  );

  return transformed;
};

const buildTagPattern = (): RegExp => {
  const tagNames = Object.keys(HTML_TAG_TO_REMOTE_COMPONENT).join('|');
  return new RegExp(`(<\\/?)\\b(${tagNames})\\b(?=[\\s>\\/>])`, 'g');
};

const TAG_PATTERN = buildTagPattern();

const DEFINE_IMPORT_PATTERN =
  /import\s*\{\s*defineFrontComponent\s*\}\s*from\s*['"][^'"]+['"];?\n?/g;

const DEFINE_EXPORT_PATTERN =
  /export\s+default\s+defineFrontComponent\s*\(\s*\{[^}]*component\s*:\s*(\w+)[^}]*\}\s*\)\s*;?/s;

const transformJsxToRemoteComponents = (source: string): string => {
  return source.replace(
    TAG_PATTERN,
    (match, prefix: string, tagName: string) => {
      const componentName =
        HTML_TAG_TO_REMOTE_COMPONENT[
          tagName as keyof typeof HTML_TAG_TO_REMOTE_COMPONENT
        ];

      if (componentName) {
        return `${prefix}${REMOTE_COMPONENTS_PREFIX}.${componentName}`;
      }

      return match;
    },
  );
};

const transformDefineFrontComponent = (source: string): string => {
  let transformed = source.replace(DEFINE_IMPORT_PATTERN, '');

  const match = transformed.match(DEFINE_EXPORT_PATTERN);

  if (match) {
    const componentName = match[1];

    const componentExportPattern = new RegExp(
      `export\\s+(const|function)\\s+${componentName}\\b`,
    );
    transformed = transformed.replace(
      componentExportPattern,
      `$1 ${componentName}`,
    );

    transformed = transformed.replace(
      DEFINE_EXPORT_PATTERN,
      `export default globalThis.jsx(${componentName}, {});`,
    );
  }

  return transformed;
};

const applyTransformations = async (
  sourcePath: string,
  source: string,
): Promise<string> => {
  const withRemoteComponents = transformJsxToRemoteComponents(source);
  const withDefineFrontComponent =
    transformDefineFrontComponent(withRemoteComponents);

  const transformed = await esbuild.transform(withDefineFrontComponent, {
    loader: 'tsx',
    jsx: 'automatic',
    sourcefile: sourcePath,
  });

  const withGlobalThis = transformReactImportsToGlobalThis(transformed.code);

  return `var RemoteComponents = globalThis.RemoteComponents;\n${withGlobalThis}`;
};

export const jsxTransformPluginToRemoteDomWorkerFormat: esbuild.Plugin = {
  name: 'jsx-transform-plugin-to-remote-dom-worker-format',
  setup: (build) => {
    build.onLoad(
      { filter: /\.front-component\.tsx$/ },
      async (args): Promise<esbuild.OnLoadResult> => {
        try {
          const source = fs.readFileSync(args.path, 'utf8');
          const contents = await applyTransformations(args.path, source);

          return { contents, loader: 'js' };
        } catch (error) {
          return {
            errors: [
              {
                text: `Failed to transform front component: ${error instanceof Error ? error.message : String(error)}`,
                location: { file: args.path },
              },
            ],
          };
        }
      },
    );
  },
};
