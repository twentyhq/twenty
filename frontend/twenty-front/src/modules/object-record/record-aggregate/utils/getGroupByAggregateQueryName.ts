import { capitalize } from 'twenty-shared/utils';

export const getGroupByAggregateQueryName = ({
  objectMetadataNamePlural,
}: {
  objectMetadataNamePlural: string;
}) => {
  return `${capitalize(objectMetadataNamePlural)}GroupByAggregates`;
};
