import { ApolloLink, gql } from '@apollo/client';
import { type ApolloCache } from '@apollo/client/cache';
import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { parse } from 'graphql';
import { map } from 'rxjs';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const WORKFLOW_RUN_TYPENAME = 'WorkflowRun';

const CACHED_WORKFLOW_RUN_UPDATED_AT_FRAGMENT = gql`
  fragment CachedWorkflowRunUpdatedAt on WorkflowRun {
    updatedAt
  }
`;

const isGraphqlObject = (value: unknown): value is Record<string, unknown> =>
  isPlainObject(value) && isNonEmptyString(value.__typename);

const isPlainFieldValue = (value: unknown) =>
  !isGraphqlObject(value) &&
  !(Array.isArray(value) && value.some(isGraphqlObject));

const keepNewerCachedFields = ({
  workflowRun,
  cache,
}: {
  workflowRun: Record<string, unknown>;
  cache: ApolloCache;
}) => {
  if (
    !isNonEmptyString(workflowRun.id) ||
    !isNonEmptyString(workflowRun.updatedAt)
  ) {
    return workflowRun;
  }

  const cacheId = `${WORKFLOW_RUN_TYPENAME}:${workflowRun.id}`;

  const cachedUpdatedAt = cache.readFragment<{ updatedAt?: string }>({
    id: cacheId,
    fragment: CACHED_WORKFLOW_RUN_UPDATED_AT_FRAGMENT,
  })?.updatedAt;

  if (
    !isNonEmptyString(cachedUpdatedAt) ||
    Date.parse(cachedUpdatedAt) <= Date.parse(workflowRun.updatedAt)
  ) {
    return workflowRun;
  }

  const plainFieldNames = Object.keys(workflowRun).filter(
    (fieldName) =>
      fieldName !== '__typename' &&
      fieldName !== 'id' &&
      isPlainFieldValue(workflowRun[fieldName]),
  );

  const cachedWorkflowRun = cache.readFragment<Record<string, unknown>>({
    id: cacheId,
    fragment: parse(
      `fragment CachedWorkflowRunFields on ${WORKFLOW_RUN_TYPENAME} { ${plainFieldNames.join(' ')} }`,
    ),
    returnPartialData: true,
  });

  if (!isDefined(cachedWorkflowRun)) {
    return workflowRun;
  }

  return {
    ...workflowRun,
    ...Object.fromEntries(
      plainFieldNames
        .filter((fieldName) => !isUndefined(cachedWorkflowRun[fieldName]))
        .map((fieldName) => [fieldName, cachedWorkflowRun[fieldName]]),
    ),
  };
};

const keepNewerCachedWorkflowRunsInFields = ({
  node,
  cache,
}: {
  node: Record<string, unknown>;
  cache: ApolloCache;
}) => {
  const patchedEntries = Object.entries(node).map(
    ([fieldName, fieldValue]) =>
      [
        fieldName,
        keepNewerCachedWorkflowRuns({ value: fieldValue, cache }),
      ] as const,
  );

  return patchedEntries.some(
    ([fieldName, patchedFieldValue]) => patchedFieldValue !== node[fieldName],
  )
    ? Object.fromEntries(patchedEntries)
    : node;
};

const keepNewerCachedWorkflowRuns = ({
  value,
  cache,
}: {
  value: unknown;
  cache: ApolloCache;
}): unknown => {
  if (Array.isArray(value)) {
    const patchedItems = value.map((item) =>
      keepNewerCachedWorkflowRuns({ value: item, cache }),
    );

    return patchedItems.some((item, index) => item !== value[index])
      ? patchedItems
      : value;
  }

  if (!isGraphqlObject(value)) {
    return value;
  }

  return keepNewerCachedWorkflowRunsInFields({
    node:
      value.__typename === WORKFLOW_RUN_TYPENAME
        ? keepNewerCachedFields({ workflowRun: value, cache })
        : value,
    cache,
  });
};

export const workflowRunStaleResponseLink = new ApolloLink(
  (operation, forward) => {
    if (
      !isNonEmptyString(operation.operationName) ||
      !operation.operationName.includes(WORKFLOW_RUN_TYPENAME)
    ) {
      return forward(operation);
    }

    return forward(operation).pipe(
      map((result) => {
        if (!isPlainObject(result.data)) {
          return result;
        }

        const patchedData = keepNewerCachedWorkflowRunsInFields({
          node: result.data,
          cache: operation.client.cache,
        });

        return patchedData === result.data
          ? result
          : { ...result, data: patchedData };
      }),
    );
  },
);
