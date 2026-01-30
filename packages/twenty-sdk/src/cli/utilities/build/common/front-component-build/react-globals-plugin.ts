import * as fs from 'fs/promises';

import type * as esbuild from 'esbuild';

import { JSX_RUNTIME_EXPORTS } from './constants/JsxRuntimeExports';
import { REACT_IMPORT_PATTERN } from './constants/ReactImportPattern';
import { extractNamesFromImportSpecifier } from './utils/extract-names-from-import-specifier';

const collectReactImports = (sourceContent: string): Set<string> => {
  const reactImports = new Set<string>();

  let match;

  while ((match = REACT_IMPORT_PATTERN.exec(sourceContent)) !== null) {
    const defaultImport = match[1];
    const namedImportsStr = match[2];

    if (defaultImport) {
      reactImports.add('default');
    }

    if (namedImportsStr) {
      namedImportsStr
        .split(',')
        .filter((specifier) => specifier.trim())
        .forEach((specifier) => {
          const { originalName } = extractNamesFromImportSpecifier(specifier);

          reactImports.add(originalName);
        });
    }
  }

  REACT_IMPORT_PATTERN.lastIndex = 0;

  return reactImports;
};

const generateReactExports = (imports: Set<string>): string => {
  const lines: string[] = [];

  for (const name of imports) {
    if (name === 'default') {
      lines.push('export default globalThis.React;');
    } else {
      lines.push(`export var ${name} = globalThis.React.${name};`);
    }
  }

  return lines.join('\n');
};

export const reactGlobalsPlugin: esbuild.Plugin = {
  name: 'react-globals',
  setup: async (build) => {
    const reactImportsByFile = new Map<string, Set<string>>();

    build.onStart(() => {
      reactImportsByFile.clear();
    });

    build.onResolve({ filter: /^react(\/jsx-runtime)?$/ }, async (args) => {
      if (args.importer && !reactImportsByFile.has(args.importer)) {
        try {
          const sourceContent = await fs.readFile(args.importer, 'utf-8');

          reactImportsByFile.set(
            args.importer,
            collectReactImports(sourceContent),
          );
        } catch {
          reactImportsByFile.set(args.importer, new Set());
        }
      }

      return {
        path: args.path,
        namespace: 'react-globals',
        pluginData: { importer: args.importer },
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'react-globals' }, (args) => {
      const importer = args.pluginData?.importer || '';
      const reactImports =
        reactImportsByFile.get(importer) || new Set<string>();

      if (args.path === 'react/jsx-runtime') {
        return {
          contents: JSX_RUNTIME_EXPORTS,
          loader: 'js',
        };
      }

      if (args.path === 'react') {
        return {
          contents: generateReactExports(reactImports),
          loader: 'js',
        };
      }

      return null;
    });
  },
};
