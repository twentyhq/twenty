import type { TargetObjectName } from '../types/mapped-source-record.type';
import type { TwentyClientLike } from '../types/twenty-client-like.type';
import { extractConnection } from './extract-twenty-result';
import { getTargetObjectApiNames } from './object-api-names';

type ExistingRecordNode = {
  id: string;
};

export const findExistingTwentyRecord = async (params: {
  client: TwentyClientLike;
  targetObject: TargetObjectName;
  externalIdField: string;
  externalIdValue: string;
}): Promise<ExistingRecordNode | null> => {
  const apiNames = getTargetObjectApiNames(params.targetObject);
  const result = await params.client.query({
    [apiNames.pluralApiName]: {
      __args: {
        filter: {
          [params.externalIdField]: { eq: params.externalIdValue },
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
        },
      },
    },
  });

  const connection = extractConnection<ExistingRecordNode>(
    result,
    apiNames.pluralApiName,
  );

  return connection.edges[0]?.node ?? null;
};
