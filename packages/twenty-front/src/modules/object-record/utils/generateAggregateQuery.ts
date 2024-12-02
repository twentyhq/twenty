import gql from 'graphql-tag';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { capitalize } from '~/utils/string/capitalize';

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
    query AggregateMany${capitalize(objectMetadataItem.namePlural)}($filter: ${capitalize(
      objectMetadataItem.nameSingular,
    )}FilterInput) {
      ${objectMetadataItem.namePlural}(filter: $filter) {
        ${selectedFields}
      }
    }
  `;
};
