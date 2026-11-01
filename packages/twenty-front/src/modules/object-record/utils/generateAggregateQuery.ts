import gql from 'graphql-tag';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFields } from 'twenty-shared/types';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { capitalize } from 'twenty-shared/utils';

export const generateAggregateQuery = ({
  objectMetadataItem,
  recordGqlFields,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordGqlFields: RecordGqlFields;
}) => {
  const selectedFields = Object.keys(recordGqlFields).join('\n      ');

  return gql`
    query ${getAggregateQueryName(objectMetadataItem.namePlural)}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput) {
      ${objectMetadataItem.namePlural}(filter: $filter) {
        ${selectedFields ? '' : '__typename'}
        ${selectedFields}
      }
    }
  `;
};
