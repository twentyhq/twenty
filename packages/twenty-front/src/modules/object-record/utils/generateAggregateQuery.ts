import gql from 'graphql-tag';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFields } from 'twenty-shared/types';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { capitalize } from 'twenty-shared/utils';

// A nested selection aggregates a field of a many-to-one related object, e.g.
// `company { sumEmployees }` on the opportunities connection.
const renderAggregateSelection = (recordGqlFields: RecordGqlFields): string =>
  Object.entries(recordGqlFields)
    .filter(([_, shouldBeQueried]) => Boolean(shouldBeQueried))
    .map(([fieldName, selection]) =>
      selection === true
        ? fieldName
        : `${fieldName} {\n      ${renderAggregateSelection(selection)}\n    }`,
    )
    .join('\n      ');

export const generateAggregateQuery = ({
  objectMetadataItem,
  recordGqlFields,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordGqlFields: RecordGqlFields;
}) => {
  const selectedFields = renderAggregateSelection(recordGqlFields);

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
