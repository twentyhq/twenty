import { createHash } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import {
  type DocumentNode,
  Kind,
  OperationTypeNode,
  parse,
  print,
} from 'graphql';
import { type MetadataResponseCacheApprovedRequest } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { stringifyWithSortedKeys } from 'src/engine/api/graphql/graphql-config/utils/stringify-with-sorted-keys.util';

export type ApprovedMetadataCacheRequest = {
  documentFingerprint: string;
  variablesFingerprint: string;
};

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

const parseDocument = (query: string): DocumentNode | undefined => {
  try {
    return parse(query);
  } catch {
    return undefined;
  }
};

const isSingleQueryNamed = (
  document: DocumentNode,
  operationName: string,
): boolean => {
  const operations = document.definitions.filter(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION,
  );

  return (
    operations.length === 1 &&
    operations[0].operation === OperationTypeNode.QUERY &&
    operations[0].name?.value === operationName
  );
};

export const findApprovedMetadataCacheRequest = ({
  operationName,
  query,
  variables,
  approvedRequests,
}: {
  operationName: string;
  query: unknown;
  variables: unknown;
  approvedRequests: MetadataResponseCacheApprovedRequest[];
}): ApprovedMetadataCacheRequest | undefined => {
  if (!isNonEmptyString(query)) {
    return undefined;
  }

  const document = parseDocument(query);

  if (!isDefined(document) || !isSingleQueryNamed(document, operationName)) {
    return undefined;
  }

  const documentFingerprint = sha256(print(document));
  const canonicalVariables = stringifyWithSortedKeys(variables ?? {});

  const approvedRequest = approvedRequests.find(
    (candidate) =>
      candidate.documentFingerprint === documentFingerprint &&
      stringifyWithSortedKeys(candidate.variables) === canonicalVariables,
  );

  if (!isDefined(approvedRequest)) {
    return undefined;
  }

  return {
    documentFingerprint,
    variablesFingerprint: sha256(canonicalVariables),
  };
};
