import { getRecordGqlRelationAliasVariables } from '@/object-record/graphql/utils/getRecordGqlRelationAliasVariables';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { sortKeysDeeply } from 'twenty-shared/utils';

export const useRecordBoardQueryIdentifier = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { combinedFilters, orderBy, recordGqlFields, relationAliases } =
    useRecordIndexGroupCommonQueryVariables();

  // The board only refetches when this identifier changes: it covers nested fields and scope arguments, not column order
  const fetchedFields = JSON.stringify(sortKeysDeeply(recordGqlFields));
  const scopedRelations = JSON.stringify(
    sortKeysDeeply(getRecordGqlRelationAliasVariables(relationAliases)),
  );

  const baseQueryIdentifier = getQueryIdentifier({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: combinedFilters,
    orderBy,
  });

  return `${baseQueryIdentifier}|fields:${fetchedFields}|scopes:${scopedRelations}`;
};
