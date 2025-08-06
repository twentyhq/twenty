import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';
export const WorkflowFindRecordsAddFilterButton = ({
  defaultFieldMetadataItem,
}: {
  defaultFieldMetadataItem: FieldMetadataItem;
}) => {
  const { readonly } = useContext(AdvancedFilterContext);
  const rootRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const setHasInitializedCurrentRecordFilters =
    useSetRecoilComponentFamilyState(
      hasInitializedCurrentRecordFiltersComponentFamilyState,
      {},
    );

  const addRootRecordFilterGroup = () => {
    const alreadyHasAdvancedFilterGroup = isDefined(rootRecordFilterGroup);

    if (!alreadyHasAdvancedFilterGroup) {
      setHasInitializedCurrentRecordFilters(false);

      const newRecordFilterGroup = {
        id: v4(),
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      };

      upsertRecordFilterGroup(newRecordFilterGroup);

      if (!isDefined(defaultFieldMetadataItem)) {
        throw new Error('Missing default filter definition');
      }

      const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
        defaultFieldMetadataItem,
      );

      newRecordFilter.recordFilterGroupId = newRecordFilterGroup.id;

      upsertRecordFilter(newRecordFilter);
    }
  };

  return (
    <Button
      Icon={IconFilter}
      size="small"
      variant="secondary"
      accent="default"
      onClick={addRootRecordFilterGroup}
      ariaLabel="Add filter"
      title="Add filter"
      disabled={readonly}
    />
  );
};
