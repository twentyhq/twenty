import * as fs from 'node:fs/promises';

import type * as esbuild from 'esbuild';

import { compileConditionExpressionsInSource } from '@/app/source/compile-condition-expressions-in-source';

export const conditionalAvailabilityTransformPlugin: esbuild.Plugin = {
  name: 'conditional-availability-transform',
  setup: (build) => {
    build.onLoad({ filter: /\.tsx?$/, namespace: 'file' }, async (args) => {
      const source = await fs.readFile(args.path, 'utf8');
      const compiledSource = compileConditionExpressionsInSource({
        source,
        filePath: args.path,
      });

      if (compiledSource === source) {
        return null;
      }

      return {
        contents: compiledSource,
        loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
      };
    });
  },
};
