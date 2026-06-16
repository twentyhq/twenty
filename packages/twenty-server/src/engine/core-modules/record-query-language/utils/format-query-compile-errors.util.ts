import { type z } from 'zod';

import { type QueryCompileError } from 'src/engine/core-modules/record-query-language/types/query-compile-result.type';

// Renders compile errors as a short bullet list the model can act on directly.
export const formatQueryCompileErrors = (errors: QueryCompileError[]): string =>
  errors
    .map((error) => {
      const suggestion =
        error.suggestion !== undefined
          ? ` Did you mean "${error.suggestion}"?`
          : '';

      return `- ${error.path}: ${error.message}${suggestion}`;
    })
    .join('\n');

// Renders Zod envelope issues (malformed AST shape) in the same bullet style.
export const formatQueryInputIssues = (error: z.ZodError): string =>
  error.issues
    .map((issue) => {
      const path = issue.path.join('.') || '(root)';

      return `- ${path}: ${issue.message}`;
    })
    .join('\n');
