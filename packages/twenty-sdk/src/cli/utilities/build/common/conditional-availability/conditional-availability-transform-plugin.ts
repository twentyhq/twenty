import type * as esbuild from 'esbuild';
import * as fs from 'fs/promises';

import { transformConditionalAvailabilityExpressionsForEsBuildPlugin } from './utils/transform-conditional-availability-expressions';

export const conditionalAvailabilityTransformPlugin: esbuild.Plugin = {
  name: 'conditional-availability-transform',
  setup: (build) => {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const source = await fs.readFile(args.path, 'utf8');

      if (!source.includes('conditionalAvailabilityExpression')) {
        return null;
      }

      const transformedSource =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      if (transformedSource === source) {
        return null;
      }

      return {
        contents: transformedSource,
        loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
      };
    });
  },
};
