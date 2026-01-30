import type * as esbuild from 'esbuild';
import * as fs from 'fs';

import { applyFrontComponentTransformationsForRemoteWorker } from './utils/apply-front-component-transformations-for-remote-worker';

export { replaceHtmlTagsWithRemoteComponents as transformJsxToRemoteComponents } from './utils/replace-html-tags-with-remote-components';

export const jsxTransformToRemoteDomWorkerFormatPlugin: esbuild.Plugin = {
  name: 'jsx-transform-to-remote-dom-worker-format-plugin',
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
            await applyFrontComponentTransformationsForRemoteWorker({
              sourceFilePath: loadArgs.path,
              sourceCode: frontComponentSourceCode,
            });

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
