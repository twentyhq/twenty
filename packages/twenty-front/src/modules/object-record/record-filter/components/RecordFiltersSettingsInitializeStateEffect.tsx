import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { attachUngroupedRecordFiltersToRootRecordFilterGroup } from '@/object-record/record-filter-group/utils/attachUngroupedRecordFiltersToRootRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { hydrateRecordFiltersFromFieldMetadata } from '@/object-record/record-filter/utils/hydrateRecordFiltersFromFieldMetadata';
import { hasInitializedRecordFiltersComponentState } from '@/object-record/record-filter/states/hasInitializedRecordFiltersComponentState';
import { type RecordFiltersWithGroups } from '@/object-record/record-filter/types/RecordFiltersWithGroups';
import { pointRecordFiltersAtMorphRelationFields } from '@/object-record/record-filter/utils/pointRecordFiltersAtMorphRelationFields';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type RecordFiltersSettingsInitializeStateEffectProps = {
  initialRecordFilters?: RecordFiltersWithGroups;
  additionalFieldMetadataItems?: FieldMetadataItem[];
};

export const RecordFiltersSettingsInitializeStateEffect = ({
  initialRecordFilters,
  additionalFieldMetadataItems,
}: RecordFiltersSettingsInitializeStateEffectProps) => {
  const [hasInitializedRecordFilters, setHasInitializedRecordFilters] =
    useAtomComponentState(hasInitializedRecordFiltersComponentState);

  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
  );

  const setCurrentRecordFilterGroups = useSetAtomComponentState(
    currentRecordFilterGroupsComponentState,
  );

  const setUnresolvedRecordFilters = useSetAtomComponentState(
    unresolvedRecordFiltersComponentState,
  );

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const { setAdvancedFilterDropdownStates } =
    useSetAdvancedFilterDropdownStates();

  const [
    shouldSetAdvancedFilterDropdownStates,
    setShouldSetAdvancedFilterDropdownStates,
  ] = useState(false);

  useEffect(() => {
    if (!hasInitializedRecordFilters && isDefined(initialRecordFilters)) {
      const { recordFilters: persistedRecordFilters, recordFilterGroups } =
        attachUngroupedRecordFiltersToRootRecordFilterGroup({
          recordFilters: pointRecordFiltersAtMorphRelationFields({
            recordFilters: initialRecordFilters.recordFilters ?? [],
            fieldMetadataItems: flattenedFieldMetadataItems,
          }),
          recordFilterGroups: initialRecordFilters.recordFilterGroups ?? [],
        });

      const { recordFilters, unresolvedRecordFilters } =
        hydrateRecordFiltersFromFieldMetadata({
          persistedRecordFilters,
          fieldMetadataItems: [
            ...flattenedFieldMetadataItems,
            ...(additionalFieldMetadataItems ?? []),
          ],
        });

      setCurrentRecordFilters(recordFilters);
      setUnresolvedRecordFilters(unresolvedRecordFilters);
      setCurrentRecordFilterGroups(recordFilterGroups);

      setShouldSetAdvancedFilterDropdownStates(true);
      setHasInitializedRecordFilters(true);
    }
  }, [
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setUnresolvedRecordFilters,
    setHasInitializedRecordFilters,
    hasInitializedRecordFilters,
    initialRecordFilters,
    flattenedFieldMetadataItems,
    additionalFieldMetadataItems,
  ]);

  useEffect(() => {
    if (shouldSetAdvancedFilterDropdownStates) {
      setAdvancedFilterDropdownStates();
      setShouldSetAdvancedFilterDropdownStates(false);
    }
  }, [shouldSetAdvancedFilterDropdownStates, setAdvancedFilterDropdownStates]);

  return null;
};
