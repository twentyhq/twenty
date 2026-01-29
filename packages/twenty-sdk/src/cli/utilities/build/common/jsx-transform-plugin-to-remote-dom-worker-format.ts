import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { HTML_TAG_TO_REMOTE_COMPONENT } from 'twenty-shared/front-component-constants';

const REMOTE_COMPONENTS_PREFIX = 'RemoteComponents';

const REACT_JSX_IMPORT_PATTERN =
  /import\s*\{([^}]+)\}\s*from\s*['"]react\/jsx-runtime['"];?/g;

const transformReactImportsToGlobalThis = (source: string): string => {
  return source.replace(REACT_JSX_IMPORT_PATTERN, (_match, imports: string) => {
    const importNames = imports.split(',').map((name) => name.trim());
    const assignments = importNames
      .map((name) => {
        if (name === 'jsx' || name === 'jsxs') {
          return `var ${name} = globalThis.${name};`;
        }
        if (name === 'Fragment') {
          return `var Fragment = globalThis.React.Fragment;`;
        }
        return `var ${name} = globalThis.React.${name};`;
      })
      .join('\n');
    return assignments;
  });
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
  return source.replace(TAG_PATTERN, (match, prefix, tagName) => {
    const componentName = HTML_TAG_TO_REMOTE_COMPONENT[tagName];
    if (componentName) {
      return `${prefix}${REMOTE_COMPONENTS_PREFIX}.${componentName}`;
    }
    return match;
  });
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

export const jsxTransformPluginToRemoteDomWorkerFormat: esbuild.Plugin = {
  name: 'jsx-transform-plugin-to-remote-dom-worker-format',
  setup: (build) => {
    build.onLoad(
      { filter: /\.front-component\.tsx$/ },
      async (args): Promise<esbuild.OnLoadResult> => {
        const source = fs.readFileSync(args.path, 'utf8');
        const withRemoteComponents = transformJsxToRemoteComponents(source);
        const withDefineFrontComponent =
          transformDefineFrontComponent(withRemoteComponents);

        const transformed = await esbuild.transform(withDefineFrontComponent, {
          loader: 'tsx',
          jsx: 'automatic',
          sourcefile: args.path,
        });

        const withGlobalThis = transformReactImportsToGlobalThis(
          transformed.code,
        );

        const withRemoteComponentsGlobal = `var RemoteComponents = globalThis.RemoteComponents;\n${withGlobalThis}`;

        return {
          contents: withRemoteComponentsGlobal,
          loader: 'js',
        };
      },
    );
  },
};
