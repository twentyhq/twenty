import { ConditionalDisplaySettingsContent } from '@/conditional-display/components/ConditionalDisplaySettingsContent';
import { useConditionalDisplayRoles } from '@/conditional-display/hooks/useConditionalDisplayRoles';
import { buildConditionalDisplayFieldSelectLeadingSections } from '@/conditional-display/utils/buildConditionalDisplayFieldSelectLeadingSections';
import { mapConditionalDisplayToPersistedRecordFilters } from '@/conditional-display/utils/mapConditionalDisplayToPersistedRecordFilters';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersSettingsInitializeStateEffect } from '@/object-record/record-filter/components/RecordFiltersSettingsInitializeStateEffect';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import {
  type ConditionalDisplay,
  type ConditionalDisplaySurface,
} from 'twenty-shared/types';
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
  onConditionalDisplayChange?: (
    conditionalDisplay: ConditionalDisplay | null,
  ) => void;
};

export const ConditionalDisplaySettings = ({
  surface,
  surfaceId,
  conditionalDisplay,
  objectMetadataId,
  onConditionalDisplayChange,
}: ConditionalDisplaySettingsProps) => {
  const instanceId = `conditional-display-${surface}-${surfaceId}`;

  const { roles } = useConditionalDisplayRoles();

  const fieldSelectLeadingSections =
    buildConditionalDisplayFieldSelectLeadingSections(roles);

  const contextFieldMetadataItems = fieldSelectLeadingSections.flatMap(
    (fieldSelectLeadingSection) => fieldSelectLeadingSection.fieldMetadataItems,
  );

  const objectMetadataItem = useAtomStateValue(
    objectMetadataItemsSelector,
  ).find((item) => item.id === objectMetadataId);

  return (
    <StyledConditionalDisplaySettingsContainer>
      <RecordFilterGroupsComponentInstanceContext.Provider
        value={{ instanceId }}
      >
        <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
          <RecordFieldsComponentInstanceContext.Provider value={{ instanceId }}>
            <ConditionalDisplaySettingsContent
              instanceId={instanceId}
              surface={surface}
              conditionalDisplay={conditionalDisplay}
              objectMetadataItem={objectMetadataItem}
              fieldSelectLeadingSections={fieldSelectLeadingSections}
              contextFieldMetadataItems={contextFieldMetadataItems}
              onConditionalDisplayChange={onConditionalDisplayChange}
            />
          </RecordFieldsComponentInstanceContext.Provider>
          <RecordFiltersSettingsInitializeStateEffect
            initialRecordFilters={{
              recordFilters:
                mapConditionalDisplayToPersistedRecordFilters(
                  conditionalDisplay,
                ),
              recordFilterGroups: conditionalDisplay?.recordFilterGroups ?? [],
            }}
            additionalFieldMetadataItems={contextFieldMetadataItems}
          />
        </RecordFiltersComponentInstanceContext.Provider>
      </RecordFilterGroupsComponentInstanceContext.Provider>
    </StyledConditionalDisplaySettingsContainer>
  );
};
