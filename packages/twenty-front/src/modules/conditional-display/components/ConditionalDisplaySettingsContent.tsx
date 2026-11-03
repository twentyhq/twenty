import { ConditionalDisplayRuleModeSelect } from '@/conditional-display/components/ConditionalDisplayRuleModeSelect';
import { type ConditionalDisplayRuleMode } from '@/conditional-display/types/ConditionalDisplayRuleMode';
import { getConditionalDisplaySettingsLabel } from '@/conditional-display/utils/getConditionalDisplaySettingsLabel';
import { sanitizeConditionalDisplay } from '@/conditional-display/utils/sanitizeConditionalDisplay';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useAddRootRecordFilterGroup } from '@/object-record/advanced-filter/hooks/useAddRootRecordFilterGroup';
import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { type FieldSelectLeadingSection } from '@/object-record/advanced-filter/types/FieldSelectLeadingSection';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { mapRecordFiltersToPersistedRecordFilters } from '@/object-record/record-filter/utils/mapRecordFiltersToPersistedRecordFilters';
import { SidePanelRecordFiltersDeletedFieldsWarning } from '@/side-panel/components/SidePanelRecordFiltersDeletedFieldsWarning';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { useState } from 'react';
import {
  type ConditionalDisplay,
  type ConditionalDisplaySurface,
} from 'twenty-shared/types';
import { assertUnreachable, isNonEmptyArray } from 'twenty-shared/utils';

type ConditionalDisplaySettingsContentProps = {
  instanceId: string;
  surface: ConditionalDisplaySurface;
  conditionalDisplay: ConditionalDisplay | null | undefined;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  fieldSelectLeadingSections: FieldSelectLeadingSection[];
  contextFieldMetadataItems: FieldMetadataItem[];
  onConditionalDisplayChange?: (
    conditionalDisplay: ConditionalDisplay | null,
  ) => void;
};

export const ConditionalDisplaySettingsContent = ({
  instanceId,
  surface,
  conditionalDisplay,
  objectMetadataItem,
  fieldSelectLeadingSections,
  contextFieldMetadataItems,
  onConditionalDisplayChange,
}: ConditionalDisplaySettingsContentProps) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    instanceId,
  );

  const currentRecordFiltersCallbackState = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
    instanceId,
  );

  const currentRecordFilterGroupsCallbackState =
    useAtomComponentStateCallbackState(
      currentRecordFilterGroupsComponentState,
      instanceId,
    );

  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
    instanceId,
  );

  const setCurrentRecordFilterGroups = useSetAtomComponentState(
    currentRecordFilterGroupsComponentState,
    instanceId,
  );

  const setUnresolvedRecordFilters = useSetAtomComponentState(
    unresolvedRecordFiltersComponentState,
    instanceId,
  );

  const store = useStore();

  const { addRootRecordFilterGroup } = useAddRootRecordFilterGroup({
    objectMetadataItem,
    fieldSelectLeadingSections,
  });

  const [selectedRuleMode, setSelectedRuleMode] =
    useState<ConditionalDisplayRuleMode>(
      isNonEmptyArray(conditionalDisplay?.recordFilters)
        ? 'CUSTOM_RULE'
        : 'EVERYONE',
    );

  const ruleMode: ConditionalDisplayRuleMode =
    selectedRuleMode === 'CUSTOM_RULE' || isNonEmptyArray(currentRecordFilters)
      ? 'CUSTOM_RULE'
      : 'EVERYONE';

  const fieldMetadataItems = objectMetadataItem?.fields ?? [];

  const validFieldMetadataIds = new Set(
    [...fieldMetadataItems, ...contextFieldMetadataItems]
      .filter((fieldMetadataItem) => fieldMetadataItem.isActive)
      .map((fieldMetadataItem) => fieldMetadataItem.id),
  );

  const handleConditionalDisplayUpdate = () => {
    onConditionalDisplayChange?.(
      sanitizeConditionalDisplay({
        recordFilters: mapRecordFiltersToPersistedRecordFilters(
          store.get(currentRecordFiltersCallbackState),
        ),
        recordFilterGroups: store.get(currentRecordFilterGroupsCallbackState),
        selectedRecordsMatch: conditionalDisplay?.selectedRecordsMatch,
        fieldMetadataItems,
      }),
    );
  };

  const handleRuleModeChange = (nextRuleMode: ConditionalDisplayRuleMode) => {
    setSelectedRuleMode(nextRuleMode);

    switch (nextRuleMode) {
      case 'EVERYONE':
        setCurrentRecordFilters([]);
        setCurrentRecordFilterGroups([]);
        setUnresolvedRecordFilters([]);
        onConditionalDisplayChange?.(null);
        return;
      case 'CUSTOM_RULE':
        addRootRecordFilterGroup();
        return;
      default:
        assertUnreachable(nextRuleMode);
    }
  };

  return (
    <>
      <ConditionalDisplayRuleModeSelect
        dropdownId={`${instanceId}-rule-mode`}
        label={getConditionalDisplaySettingsLabel(surface)}
        ruleMode={ruleMode}
        onRuleModeChange={handleRuleModeChange}
      />
      {ruleMode === 'CUSTOM_RULE' && (
        <>
          <SidePanelRecordFiltersDeletedFieldsWarning
            validFieldMetadataIds={validFieldMetadataIds}
          />
          <AdvancedFilterSidePanelContainer
            onUpdate={handleConditionalDisplayUpdate}
            objectMetadataItem={objectMetadataItem}
            fieldSelectLeadingSections={fieldSelectLeadingSections}
          />
        </>
      )}
    </>
  );
};
