import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { isLookupColumnsEnabledSelector } from '@/object-record/record-column-lookup/states/isLookupColumnsEnabledSelector';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getScopedRelationAliases } from '@/object-record/record-column-scope/utils/getScopedRelationAliases';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

export const useScopedRelationAliases = (): ScopedRelationAlias[] => {
  const isLookupColumnsEnabled = useAtomStateValue(
    isLookupColumnsEnabledSelector,
  );
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );
  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  const { filterValueDependencies } = useFilterValueDependencies();

  return useMemo(
    () =>
      getScopedRelationAliases({
        recordFields: visibleRecordFields,
        fieldMetadataItemByFieldMetadataItemId,
        objectMetadataItems,
        fieldMetadataItems: flattenedFieldMetadataItems,
        filterValueDependencies,
        isLookupColumnsEnabled,
      }),
    [
      visibleRecordFields,
      fieldMetadataItemByFieldMetadataItemId,
      objectMetadataItems,
      flattenedFieldMetadataItems,
      filterValueDependencies,
      isLookupColumnsEnabled,
    ],
  );
};
