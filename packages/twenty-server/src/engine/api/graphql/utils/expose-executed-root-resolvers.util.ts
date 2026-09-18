import { type ServerResponse } from 'http';

import { type DocumentNode } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';
import { REQUEST_RESOLVERS_HEADER } from 'src/engine/constants/request-attribution-headers.constant';

const MAX_EXPOSED_ROOT_RESOLVERS_LENGTH = 512;

// The access log reads this header, so the value has to name what the request
// actually executes: a document may hold several named operations while only
// the one operationName selects runs. Both /graphql pipelines call this, since
// direct execution ends the response before the parsing hooks run.
export const exposeExecutedRootResolvers = ({
  response,
  document,
  operationName,
}: {
  response: ServerResponse | undefined;
  document: DocumentNode;
  operationName: string | undefined;
}): void => {
  if (!isDefined(response) || response.headersSent) {
    return;
  }

  const rootResolverNames = computeRootResolverNames(document, operationName);

  if (rootResolverNames.length === 0) {
    return;
  }

  response.setHeader(
    REQUEST_RESOLVERS_HEADER,
    truncateResolverNames(rootResolverNames),
  );
};

const computeRootResolverNames = (
  document: DocumentNode,
  operationName: string | undefined,
): string[] => {
  try {
    return graphQLExtractTopLevelFields(document, operationName)
      .map((field) => field.name.value)
      .filter((name) => !name.startsWith('__'));
  } catch {
    // An ambiguous or unmatched operationName executes nothing, and attributing
    // a request must never be what makes it fail.
    return [];
  }
};

const truncateResolverNames = (rootResolverNames: string[]): string => {
  const joined = rootResolverNames.join(',');

  if (joined.length <= MAX_EXPOSED_ROOT_RESOLVERS_LENGTH) {
    return joined;
  }

  const kept: string[] = [];
  let length = 0;

  for (const name of rootResolverNames) {
    if (length + name.length + 1 > MAX_EXPOSED_ROOT_RESOLVERS_LENGTH) {
      break;
    }

    kept.push(name);
    length += name.length + 1;
  }

  return `${kept.join(',')},+${rootResolverNames.length - kept.length}`;
};
