import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { isAllRecordGroupsTabActiveComponentSelector } from '@/object-record/record-group/states/selectors/isAllRecordGroupsTabActiveComponentSelector';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { computeVisibleRecordGroupsFilter } from '@/object-record/record-group/utils/computeVisibleRecordGroupsFilter';
import { isAllRecordGroupsTabFilteredByVisibleGroups } from '@/object-record/record-group/utils/isAllRecordGroupsTabFilteredByVisibleGroups';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useRecordGroupFilter = (fields: FieldMetadataItem[]) => {
  const currentRecordGroupDefinition = useCurrentRecordGroupDefinition();
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const isAllRecordGroupsTabActive = useAtomComponentSelectorValue(
    isAllRecordGroupsTabActiveComponentSelector,
  );

  const hiddenRecordGroupIds = useAtomComponentSelectorValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const recordGroupFilter = useMemo((): RecordGqlOperationFilter => {
    if (
      isAllRecordGroupsTabActive &&
      isAllRecordGroupsTabFilteredByVisibleGroups({
        hiddenRecordGroupIds,
        recordGroupFieldMetadata: recordIndexGroupFieldMetadataItem,
      })
    ) {
      return computeVisibleRecordGroupsFilter({
        recordGroupFieldMetadata: recordIndexGroupFieldMetadataItem,
        recordGroupDefinitions,
      });
    }

    if (isDefined(currentRecordGroupDefinition)) {
      const fieldMetadataItem = fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === recordIndexGroupFieldMetadataItem?.id,
      );

      if (!fieldMetadataItem) {
        throw new Error(
          doNotTranslate(
            `Field metadata item with id ${recordIndexGroupFieldMetadataItem?.id} not found`,
          ),
        );
      }

      const recordGroupColumnName =
        getFieldMetadataItemGqlFieldName(fieldMetadataItem);

      if (!isDefined(currentRecordGroupDefinition.value)) {
        return { [recordGroupColumnName]: { is: 'NULL' } };
      }

      return {
        [recordGroupColumnName]: {
          eq: currentRecordGroupDefinition.value,
        },
      };
    }

    return {};
  }, [
    currentRecordGroupDefinition,
    fields,
    hiddenRecordGroupIds,
    isAllRecordGroupsTabActive,
    recordGroupDefinitions,
    recordIndexGroupFieldMetadataItem,
  ]);

  return { recordGroupFilter };
};
