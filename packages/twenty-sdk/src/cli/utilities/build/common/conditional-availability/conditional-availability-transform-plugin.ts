import type * as esbuild from 'esbuild';
import * as fs from 'fs/promises';

import { toExprEval } from './to-expr-eval';

const CONDITIONAL_AVAILABILITY_EXPRESSION_PATTERN =
  /(conditionalAvailabilityExpression\s*:\s*)(?!['"`])([^,}]+)/g;

const transformConditionalAvailabilityExpressions = (source: string): string =>
  source.replace(
    CONDITIONAL_AVAILABILITY_EXPRESSION_PATTERN,
    (_, prefix: string, rawExpression: string) =>
      prefix + JSON.stringify(toExprEval(rawExpression.trim())),
  );

export const conditionalAvailabilityTransformPlugin: esbuild.Plugin = {
  name: 'conditional-availability-transform',
  setup: (build) => {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const source = await fs.readFile(args.path, 'utf8');

      if (!source.includes('conditionalAvailabilityExpression')) {
        return null;
      }

      const transformed = transformConditionalAvailabilityExpressions(source);

      if (transformed === source) {
        return null;
      }

      return {
        contents: transformed,
        loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts',
      };
    });
  },
};
