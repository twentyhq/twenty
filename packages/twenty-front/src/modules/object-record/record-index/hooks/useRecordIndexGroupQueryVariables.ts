import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';
import { combineFilters, isDefined } from 'twenty-shared/utils';

export const useRecordIndexGroupQueryVariables = ({
  recordGroupId,
}: {
  recordGroupId: string;
}) => {
  const { combinedFilters, orderBy, recordGqlFields } =
    useRecordIndexGroupCommonQueryVariables();

  const recordGroupDefinition = useRecoilValue(
    recordGroupDefinitionFamilyState(recordGroupId),
  );
  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordGroupFieldMetadataComponentState,
  );

  const recordIndexKanbanFieldMetadataFilterValue = isDefined(
    recordGroupDefinition?.value,
  )
    ? { in: [recordGroupDefinition?.value] }
    : { is: 'NULL' };

  if (!isDefined(recordGroupFieldMetadata)) {
    return null;
  }

  const filters = combineFilters([
    combinedFilters,
    {
      [recordGroupFieldMetadata.name]:
        recordIndexKanbanFieldMetadataFilterValue,
    },
  ]);

  return {
    filters,
    orderBy,
    recordGqlFields,
  };
};
