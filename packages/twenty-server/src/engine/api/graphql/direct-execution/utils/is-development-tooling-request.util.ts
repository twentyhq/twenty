import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { parse } from 'graphql';

import { classifyTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/classify-top-level-fields.util';
import { extractTopLevelFieldsSafely } from 'src/engine/api/graphql/utils/extract-top-level-fields-safely.util';

export const isDevelopmentToolingRequest = (
  request: Pick<Request, 'body' | 'query'>,
): boolean => {
  const query = request.body?.query ?? request.query?.query;

  if (!isNonEmptyString(query)) {
    return true;
  }

  try {
    const { hasIntrospectionFields, hasCoreFields } = classifyTopLevelFields(
      extractTopLevelFieldsSafely(parse(query), request.body?.operationName),
      new Set(),
    );

    return hasIntrospectionFields && !hasCoreFields;
  } catch {
    return false;
  }
};
