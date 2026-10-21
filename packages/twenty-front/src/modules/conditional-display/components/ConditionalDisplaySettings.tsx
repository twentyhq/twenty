import { ConditionalDisplaySubjectSections } from '@/conditional-display/components/ConditionalDisplaySubjectSections';
import { ConditionalDisplayVisibilityModeSelect } from '@/conditional-display/components/ConditionalDisplayVisibilityModeSelect';
import { type ConditionalDisplayVisibilityMode } from '@/conditional-display/types/ConditionalDisplayVisibilityMode';
import { getConditionalDisplaySettingsLabel } from '@/conditional-display/utils/getConditionalDisplaySettingsLabel';
import { hasConditionalDisplayRule } from '@/conditional-display/utils/hasConditionalDisplayRule';
import { mapConditionalDisplayToPersistedRecordFilters } from '@/conditional-display/utils/mapConditionalDisplayToPersistedRecordFilters';
import { sanitizeConditionalDisplay } from '@/conditional-display/utils/sanitizeConditionalDisplay';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { mapRecordFiltersToPersistedRecordFilters } from '@/object-record/record-filter/utils/mapRecordFiltersToPersistedRecordFilters';
import { SidePanelRecordFiltersDeletedFieldsWarning } from '@/side-panel/components/SidePanelRecordFiltersDeletedFieldsWarning';
import { ChartFiltersSettingsInitializeStateEffect } from '@/side-panel/pages/page-layout/components/ChartFiltersSettingsInitializeStateEffect';
import { hasInitializedChartFiltersComponentState } from '@/side-panel/pages/page-layout/states/hasInitializedChartFiltersComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { CONDITIONAL_DISPLAY_CONTEXT_KEYS } from 'twenty-shared/constants';
import {
  type ConditionalDisplay,
  type ConditionalDisplayContextKey,
  type ConditionalDisplaySurface,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledConditionalDisplaySettingsContainer = styled.div`
  display: flex;
  flex-direction: column;

  gap: ${themeCssVariables.spacing[4]};

  padding: ${themeCssVariables.spacing[3]};
`;

type ConditionalDisplaySettingsProps = {
  surface: ConditionalDisplaySurface;
  surfaceId: string;
  conditionalDisplay: ConditionalDisplay | null | undefined;
  objectMetadataId?: string | null;
  readonly?: boolean;
  onConditionalDisplayChange?: (
    conditionalDisplay: ConditionalDisplay | null,
  ) => void;
};

export const ConditionalDisplaySettings = ({
  surface,
  surfaceId,
  conditionalDisplay,
  objectMetadataId,
  readonly,
  onConditionalDisplayChange,
}: ConditionalDisplaySettingsProps) => {
  const instanceId = `conditional-display-${surface}-${surfaceId}`;

  const availableContextKeys = (
    Object.keys(
      CONDITIONAL_DISPLAY_CONTEXT_KEYS,
    ) as ConditionalDisplayContextKey[]
  ).filter((contextKey) =>
    CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey].surfaces.includes(surface),
  );

  const objectMetadataItem = useAtomStateValue(
    objectMetadataItemsSelector,
  ).find((item) => item.id === objectMetadataId);

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

  const store = useStore();

  const setHasInitializedChartFilters = useSetAtomComponentState(
    hasInitializedChartFiltersComponentState,
    instanceId,
  );

  useEffect(
    () => () => setHasInitializedChartFilters(false),
    [setHasInitializedChartFilters],
  );

  const visibilityMode: ConditionalDisplayVisibilityMode =
    isNonEmptyArray(currentRecordFilters) ||
    hasConditionalDisplayRule(conditionalDisplay)
      ? 'CUSTOM_RULE'
      : 'EVERYONE';

  const fieldMetadataItems = objectMetadataItem?.fields ?? [];

  const validFieldMetadataIds = new Set(
    fieldMetadataItems
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
        quantifier: conditionalDisplay?.quantifier,
        availableContextKeys,
        fieldMetadataItems,
      }),
    );
  };

  return (
    <StyledConditionalDisplaySettingsContainer>
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId }}
      >
        <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
          <AdvancedFilterContext.Provider
            value={{
              onUpdate: readonly ? undefined : handleConditionalDisplayUpdate,
              readonly,
              objectMetadataItem,
              availableContextKeys,
            }}
          >
            <ConditionalDisplayVisibilityModeSelect
              dropdownId={`${instanceId}-visibility-mode`}
              label={getConditionalDisplaySettingsLabel(surface)}
              visibilityMode={visibilityMode}
              readonly={readonly}
              onEveryoneSelect={() => onConditionalDisplayChange?.(null)}
            />
            {visibilityMode === 'CUSTOM_RULE' && (
              <>
                {isDefined(objectMetadataItem) && (
                  <SidePanelRecordFiltersDeletedFieldsWarning
                    validFieldMetadataIds={validFieldMetadataIds}
                  />
                )}
                <RecordFieldsComponentInstanceContext.Provider
                  value={{ instanceId }}
                >
                  <AdvancedFilterSidePanelContainer
                    readonly={readonly}
                    onUpdate={handleConditionalDisplayUpdate}
                    objectMetadataItem={objectMetadataItem}
                    availableContextKeys={availableContextKeys}
                    FieldSelectLeadingSections={
                      ConditionalDisplaySubjectSections
                    }
                  />
                </RecordFieldsComponentInstanceContext.Provider>
              </>
            )}
          </AdvancedFilterContext.Provider>
          <ChartFiltersSettingsInitializeStateEffect
            initialChartFilters={{
              recordFilters:
                mapConditionalDisplayToPersistedRecordFilters(
                  conditionalDisplay,
                ),
              recordFilterGroups: conditionalDisplay?.recordFilterGroups ?? [],
            }}
          />
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </StyledConditionalDisplaySettingsContainer>
  );
};
