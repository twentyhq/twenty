import { mapConditionalDisplayToPersistedRecordFilters } from '@/conditional-display/utils/mapConditionalDisplayToPersistedRecordFilters';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { attachUngroupedRecordFiltersToRootRecordFilterGroup } from '@/object-record/record-filter-group/utils/attachUngroupedRecordFiltersToRootRecordFilterGroup';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { hydrateRecordFiltersFromFieldMetadata } from '@/object-record/record-filter/utils/hydrateRecordFiltersFromFieldMetadata';
import { pointRecordFiltersAtMorphRelationFields } from '@/object-record/record-filter/utils/pointRecordFiltersAtMorphRelationFields';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useState } from 'react';
import { type ConditionalDisplay } from 'twenty-shared/types';

type ConditionalDisplaySettingsInitializeStateEffectProps = {
  initialConditionalDisplay: ConditionalDisplay | null | undefined;
};

export const ConditionalDisplaySettingsInitializeStateEffect = ({
  initialConditionalDisplay,
}: ConditionalDisplaySettingsInitializeStateEffectProps) => {
  const [
    hasInitializedConditionalDisplay,
    setHasInitializedConditionalDisplay,
  ] = useState(false);

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
    if (!hasInitializedConditionalDisplay) {
      const { recordFilters: persistedRecordFilters, recordFilterGroups } =
        attachUngroupedRecordFiltersToRootRecordFilterGroup({
          recordFilters: pointRecordFiltersAtMorphRelationFields({
            recordFilters: mapConditionalDisplayToPersistedRecordFilters(
              initialConditionalDisplay,
            ),
            fieldMetadataItems: flattenedFieldMetadataItems,
          }),
          recordFilterGroups:
            initialConditionalDisplay?.recordFilterGroups ?? [],
        });

      const { recordFilters, unresolvedRecordFilters } =
        hydrateRecordFiltersFromFieldMetadata({
          persistedRecordFilters,
          fieldMetadataItems: flattenedFieldMetadataItems,
        });

      setCurrentRecordFilters(recordFilters);
      setUnresolvedRecordFilters(unresolvedRecordFilters);
      setCurrentRecordFilterGroups(recordFilterGroups);

      setShouldSetAdvancedFilterDropdownStates(true);
      setHasInitializedConditionalDisplay(true);
    }
  }, [
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setUnresolvedRecordFilters,
    setHasInitializedConditionalDisplay,
    hasInitializedConditionalDisplay,
    initialConditionalDisplay,
    flattenedFieldMetadataItems,
  ]);

  useEffect(() => {
    if (shouldSetAdvancedFilterDropdownStates) {
      setAdvancedFilterDropdownStates();
      setShouldSetAdvancedFilterDropdownStates(false);
    }
  }, [shouldSetAdvancedFilterDropdownStates, setAdvancedFilterDropdownStates]);

  return null;
};
