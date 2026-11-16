import {
  DEFAULT_API_URL_NAME,
  DEFAULT_INTERNAL_API_URL_NAME,
} from 'twenty-shared/application-runtime';

export const buildDefaultApiUrlExpression = (path: string): string =>
  `\`\${process.env.${DEFAULT_INTERNAL_API_URL_NAME} || process.env.${DEFAULT_API_URL_NAME}}${path}\``;
