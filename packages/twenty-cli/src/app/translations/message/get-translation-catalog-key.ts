import { CONTEXT_SEPARATOR } from './context-separator.constant';

export const getTranslationCatalogKey = (
  message: string,
  context?: string,
): string =>
  context !== undefined && context.length > 0
    ? `${context}${CONTEXT_SEPARATOR}${message}`
    : message;
