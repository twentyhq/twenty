import type * as esbuild from 'esbuild';
import * as fs from 'node:fs/promises';

import { replaceHtmlTagsWithRemoteComponents } from './utils/replace-html-tags-with-remote-components';
import { unwrapDefineFrontComponentToDirectExport } from './utils/unwrap-define-front-component-to-direct-export';

export { replaceHtmlTagsWithRemoteComponents as transformJsxToRemoteComponents } from './utils/replace-html-tags-with-remote-components';

export const jsxTransformToRemoteDomWorkerFormatPlugin: esbuild.Plugin = {
  name: 'jsx-transform-to-remote-dom-worker-format-plugin',
  setup: (esbuildBuild) => {
    esbuildBuild.onLoad(
      { filter: /\.tsx$/ },
      async ({ path }): Promise<esbuild.OnLoadResult> => {
        try {
          const frontComponentSourceCode = await fs.readFile(path, 'utf8');

          // HTML tag → custom element mapping is handled at runtime by
          // the jsx-runtime wrapper plugin (which also converts style
          // objects to CSS strings).  Build-time replacement is no longer
          // needed and would bypass the wrapper's style conversion.
          const transformedContents =
            unwrapDefineFrontComponentToDirectExport(
              frontComponentSourceCode,
            );

          return { contents: transformedContents, loader: 'tsx' };
        } catch (transformError) {
          return {
            errors: [
              {
                text: `Failed to transform front component: ${transformError instanceof Error ? transformError.message : String(transformError)}`,
                location: { file: path },
              },
            ],
          };
        }
      },
    );
  },
};
