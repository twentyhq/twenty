import gql from 'graphql-tag';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { capitalize } from 'twenty-shared/utils';

export const generateAggregateQuery = ({
  objectMetadataItem,
  recordGqlFields,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordGqlFields: RecordGqlFields;
}) => {
  const selectedFields = Object.entries(recordGqlFields)
    .filter(([_, shouldBeQueried]) => shouldBeQueried)
    .map(([fieldName]) => fieldName)
    .join('\n      ');

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
