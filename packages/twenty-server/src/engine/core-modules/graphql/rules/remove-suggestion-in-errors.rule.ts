import { type ASTVisitor, type ValidationContext } from 'graphql';

export const removeSuggestionInErrorsRule = (
  context: ValidationContext,
): ASTVisitor => {
  const originalReportError = context.reportError.bind(context);

  context.reportError = (error) => {
    error.message = error.message.replace(/ Did you mean[^?]*\?/g, '');
    originalReportError(error);
  };

  return {};
};
