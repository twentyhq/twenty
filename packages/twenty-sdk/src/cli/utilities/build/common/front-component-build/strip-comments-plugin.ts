import { readFile, writeFile } from 'node:fs/promises';
import path from 'path';

import type * as esbuild from 'esbuild';

const SINGLE_LINE_COMMENT_PATTERN = /^\/\/.*$\n/gm;

export const stripCommentsPlugin: esbuild.Plugin = {
  name: 'strip-comments',
  setup: (build) => {
    build.onEnd(async (result) => {
      if (result.errors.length > 0) {
        return;
      }

      const outputFiles = Object.keys(result.metafile?.outputs ?? {}).filter(
        (file) => file.endsWith('.mjs'),
      );

      for (const outputFile of outputFiles) {
        const absolutePath = path.resolve(outputFile);
        const content = await readFile(absolutePath, 'utf-8');
        const stripped = content.replace(SINGLE_LINE_COMMENT_PATTERN, '');

        if (stripped !== content) {
          await writeFile(absolutePath, stripped, 'utf-8');
        }
      }
    });
  },
};
