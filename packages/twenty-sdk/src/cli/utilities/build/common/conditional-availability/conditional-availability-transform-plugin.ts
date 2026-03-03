import type * as esbuild from 'esbuild';
import * as fs from 'fs/promises';
import ts from 'typescript';

import { toExprEval } from './to-expr-eval';

const transformConditionalAvailabilityExpressions = (
  source: string,
  filePath: string,
): string => {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
  );

  const replacements: { start: number; end: number; text: string }[] = [];

  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'conditionalAvailabilityExpression' &&
      !ts.isStringLiteral(node.initializer) &&
      !ts.isNoSubstitutionTemplateLiteral(node.initializer)
    ) {
      const rawExpression = source.slice(
        node.initializer.getStart(sourceFile),
        node.initializer.getEnd(),
      );

      const exprEvalString = toExprEval(rawExpression);

      replacements.push({
        start: node.initializer.getStart(sourceFile),
        end: node.initializer.getEnd(),
        text: JSON.stringify(exprEvalString),
      });
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (replacements.length === 0) {
    return source;
  }

  let result = source;

  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    result =
      result.slice(0, replacement.start) +
      replacement.text +
      result.slice(replacement.end);
  }

  return result;
};

export const conditionalAvailabilityTransformPlugin: esbuild.Plugin = {
  name: 'conditional-availability-transform',
  setup: (build) => {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const source = await fs.readFile(args.path, 'utf8');

      if (!source.includes('conditionalAvailabilityExpression')) {
        return null;
      }

      const transformed = transformConditionalAvailabilityExpressions(
        source,
        args.path,
      );

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
