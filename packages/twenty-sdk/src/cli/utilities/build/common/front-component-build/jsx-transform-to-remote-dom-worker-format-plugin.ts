import type * as esbuild from 'esbuild';
import * as fs from 'node:fs/promises';

import { unwrapDefineFrontComponentToDirectExport } from './utils/unwrap-define-front-component-to-direct-export';

export const jsxTransformToRemoteDomWorkerFormatPlugin: esbuild.Plugin = {
  name: 'jsx-transform-to-remote-dom-worker-format-plugin',
  setup: (esbuildBuild) => {
    esbuildBuild.onLoad(
      { filter: /\.tsx$/ },
      async ({ path }): Promise<esbuild.OnLoadResult> => {
        try {
          const frontComponentSourceCode = await fs.readFile(path, 'utf8');

          const transformedContents = unwrapDefineFrontComponentToDirectExport(
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
