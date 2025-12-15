import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { type WorkflowManualTrigger } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { MANUAL_TRIGGER_AVAILABILITY_TYPE_OPTIONS } from '@/workflow/workflow-trigger/constants/ManualTriggerAvailabilityTypeOptions';
import { MANUAL_TRIGGER_IS_PINNED_OPTIONS } from '@/workflow/workflow-trigger/constants/ManualTriggerIsPinnedOptions';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

type WorkflowEditTriggerManualProps = {
  trigger: WorkflowManualTrigger;
  triggerOptions:
    | {
        readonly: true;
        onTriggerUpdate?: undefined;
      }
    | {
        readonly?: false;
        onTriggerUpdate: (trigger: WorkflowManualTrigger) => void;
      };
};

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(0.25)};
`;

const StyledIconPickerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const WorkflowEditTriggerManual = ({
  trigger,
  triggerOptions,
}: WorkflowEditTriggerManualProps) => {
  const theme = useTheme();

  const { t } = useLingui();

  const { getIcon } = useIcons();
  const maxRecordsFormatted = QUERY_MAX_RECORDS.toLocaleString();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
      Icon: getIcon(item.icon),
    }));

  const availability = trigger.settings.availability;

  const availabilityDescriptions = {
    SINGLE_RECORD: t`The selected record will be passed to your workflow`,
    BULK_RECORDS: t`The selected records (up to ${maxRecordsFormatted}) will be passed to your workflow`,
    GLOBAL: t`No record is required to trigger this workflow`,
  };

  return (
    <>
      <WorkflowStepBody>
        <Select
          dropdownId="workflow-edit-manual-trigger-availability"
          label={t`Availability`}
          description={
            availability?.type
              ? availabilityDescriptions[availability.type]
              : undefined
          }
          fullWidth
          disabled={triggerOptions.readonly}
          value={availability?.type}
          options={MANUAL_TRIGGER_AVAILABILITY_TYPE_OPTIONS}
          onChange={(availabilityType) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate({
              ...trigger,
              settings: getManualTriggerDefaultSettings({
                availabilityType,
                activeNonSystemObjectMetadataItems,
                icon: trigger.settings.icon,
                isPinned: trigger.settings.isPinned,
              }),
            });
          }}
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        {availability?.type === 'SINGLE_RECORD' ||
        availability?.type === 'BULK_RECORDS' ? (
          <Select
            dropdownId="workflow-edit-manual-trigger-object"
            label={t`Object`}
            description={t`On which object(s) should this trigger be available`}
            fullWidth
            value={availability?.objectNameSingular}
            options={availableMetadata}
            disabled={triggerOptions.readonly}
            onChange={(objectNameSingular) => {
              if (triggerOptions.readonly === true || !availability) {
                return;
              }

              triggerOptions.onTriggerUpdate({
                ...trigger,
                settings: {
                  ...trigger.settings,
                  availability: {
                    type: availability.type,
                    objectNameSingular,
                  },
                  objectType: objectNameSingular,
                  outputSchema: {},
                },
              });
            }}
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          />
        ) : null}

        <IconPicker
          dropdownId="workflow-edit-manual-trigger-icon"
          selectedIconKey={trigger.settings.icon}
          dropdownOffset={{ y: -parseInt(theme.spacing(3), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          maxIconsVisible={9 * 8} // 9 columns * 8 lines
          disabled={triggerOptions.readonly}
          clickableComponent={
            <StyledIconPickerContainer
              onClick={(e) => {
                if (triggerOptions.readonly === true) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
            >
              <StyledLabel>{t`Command Icon`}</StyledLabel>
              <SelectControl
                isDisabled={triggerOptions.readonly}
                selectedOption={{
                  Icon: getIcon(trigger.settings.icon),
                  value: trigger.settings.icon || null,
                  label: '',
                }}
              />
              <StyledDescription>{t`The icon your workflow trigger will display in the command menu`}</StyledDescription>
            </StyledIconPickerContainer>
          }
          onChange={({ iconKey }) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate({
              ...trigger,
              settings: {
                ...trigger.settings,
                icon: iconKey,
              },
            });
          }}
        />

        <Select
          dropdownId="workflow-edit-manual-trigger-navbar"
          label={t`Navbar`}
          description={t`Display a button in the top navbar to trigger this workflow`}
          fullWidth
          value={trigger.settings.isPinned}
          options={MANUAL_TRIGGER_IS_PINNED_OPTIONS}
          disabled={triggerOptions.readonly}
          onChange={(updatedValue) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate({
              ...trigger,
              settings: {
                ...trigger.settings,
                isPinned: updatedValue,
                outputSchema: {},
              },
            });
          }}
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
      </WorkflowStepBody>
      {!triggerOptions.readonly && (
        <WorkflowStepFooter stepId={TRIGGER_STEP_ID} />
      )}
    </>
  );
};
