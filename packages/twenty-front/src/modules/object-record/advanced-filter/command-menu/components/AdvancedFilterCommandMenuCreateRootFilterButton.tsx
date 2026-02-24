import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentFamilyStateV2';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

export const AdvancedFilterCommandMenuCreateRootFilterButton = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { readonly } = useContext(AdvancedFilterContext);
  const rootRecordFilterGroup = useRecoilComponentSelectorValueV2(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const availableFieldMetadataItemsForFilter = useFamilySelectorValueV2(
    availableFieldMetadataItemsForFilterFamilySelector,
    {
      objectMetadataItemId: objectMetadataItem.id,
    },
  );

  const defaultFieldMetadataItem =
    availableFieldMetadataItemsForFilter.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id ===
        objectMetadataItem?.labelIdentifierFieldMetadataId,
    ) ?? availableFieldMetadataItemsForFilter[0];

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const setHasInitializedCurrentRecordFilters =
    useSetRecoilComponentFamilyStateV2(
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
      ariaLabel={t`Add filter`}
      title={t`Add filter`}
      disabled={readonly}
    />
  );
};
