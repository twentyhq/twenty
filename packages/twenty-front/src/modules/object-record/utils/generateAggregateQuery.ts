import gql from 'graphql-tag';
import { type DocumentNode } from 'graphql';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { capitalize } from 'twenty-shared/utils';

const queryCache = new Map<string, DocumentNode>();

export const generateAggregateQuery = ({
  objectMetadataItem,
  recordGqlFields,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordGqlFields: RecordGqlFields;
}) => {
  const selectedFields = Object.entries(recordGqlFields)
    .filter(([_, shouldBeQueried]) => Boolean(shouldBeQueried))
    .map(([fieldName]) => fieldName)
    .join('\n      ');

  const queryString = `
    query ${getAggregateQueryName(objectMetadataItem.namePlural)}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput) {
      ${objectMetadataItem.namePlural}(filter: $filter) {
        ${selectedFields ? '' : '__typename'}
        ${selectedFields}
      }
    }
  `;

  let cachedQuery = queryCache.get(queryString);
  if (!cachedQuery) {
    cachedQuery = gql(queryString);
    queryCache.set(queryString, cachedQuery);
  }
  return cachedQuery;
};
