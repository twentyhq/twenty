import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
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
  const rootRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const availableFieldMetadataItemsForFilter = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
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
      ariaLabel={t`Add filter`}
      title={t`Add filter`}
      disabled={readonly}
    />
  );
};
