import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useAdvancedFilterFieldMetadataItems } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldMetadataItems';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { getDefaultFieldMetadataItemForFilter } from '@/object-record/advanced-filter/utils/getDefaultFieldMetadataItemForFilter';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { useContext } from 'react';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { IconFilter } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { v4 } from 'uuid';
import { useLingui } from '@lingui/react/macro';

export const AdvancedFilterSidePanelCreateRootFilterButton = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { t } = useLingui();
  const { readonly } = useContext(AdvancedFilterContext);
  const rootRecordFilterGroup = useAtomComponentSelectorValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { advancedFilterFieldMetadataItems } =
    useAdvancedFilterFieldMetadataItems();

  const defaultFieldMetadataItem = getDefaultFieldMetadataItemForFilter({
    objectMetadataItem,
    filterableFieldMetadataItems: advancedFilterFieldMetadataItems,
  });

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const setHasInitializedCurrentRecordFilters = useSetAtomComponentFamilyState(
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
        throw new Error(doNotTranslate('Missing default filter definition'));
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
      startIcon={<IconFilter />}
      size="sm"
      onClick={addRootRecordFilterGroup}
      aria-label={t`Add filter`}
      disabled={readonly}
      variant="outline"
    >{t`Add filter`}</Button>
  );
};
