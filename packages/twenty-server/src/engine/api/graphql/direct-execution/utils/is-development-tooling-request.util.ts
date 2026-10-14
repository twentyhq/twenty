import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { type DocumentNode, parse } from 'graphql';

import { classifyTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/classify-top-level-fields.util';
import { extractTopLevelFieldsSafely } from 'src/engine/api/graphql/utils/extract-top-level-fields-safely.util';

export const isDevelopmentToolingRequest = (request: Request): boolean => {
  const query = request.body?.query ?? request.query?.query;

  if (!isNonEmptyString(query)) {
    return true;
  }

  let document: DocumentNode;

  try {
    document = parse(query);
  } catch {
    return false;
  }

  const { hasIntrospectionFields, hasCoreFields } = classifyTopLevelFields(
    extractTopLevelFieldsSafely(document, request.body?.operationName),
    new Set(),
  );

  return hasIntrospectionFields && !hasCoreFields;
};
