import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import {
  WorkflowManualTrigger,
  WorkflowManualTriggerAvailability,
} from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { MANUAL_TRIGGER_AVAILABILITY_OPTIONS } from '@/workflow/workflow-trigger/constants/ManualTriggerAvailabilityOptions';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';
import { getTriggerHeaderType } from '@/workflow/workflow-trigger/utils/getTriggerHeaderType';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerDefaultLabel } from '@/workflow/workflow-trigger/utils/getTriggerDefaultLabel';
import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { SelectControl } from '@/ui/input/components/SelectControl';
import styled from '@emotion/styled';

type WorkflowEditTriggerManualFormProps = {
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

export const WorkflowEditTriggerManualForm = ({
  trigger,
  triggerOptions,
}: WorkflowEditTriggerManualFormProps) => {
  const theme = useTheme();

  const { t } = useLingui();

  const { getIcon } = useIcons();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
      Icon: getIcon(item.icon),
    }));

  const objectType = trigger.settings.objectType;

  const manualTriggerAvailability: WorkflowManualTriggerAvailability =
    isDefined(objectType) ? 'WHEN_RECORD_SELECTED' : 'EVERYWHERE';

  const headerTitle = trigger.name ?? getTriggerDefaultLabel(trigger);

  const headerIcon = getTriggerIcon(trigger);

  const headerType = getTriggerHeaderType(trigger);

  const availabilityDescriptions = {
    WHEN_RECORD_SELECTED: t`Select a record then open the ⌘K to trigger this workflow`,
    EVERYWHERE: t`Open the ⌘K to trigger this workflow`,
  };

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (triggerOptions.readonly === true) {
            return;
          }

          triggerOptions.onTriggerUpdate({
            ...trigger,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={triggerOptions.readonly}
      />
      <WorkflowStepBody>
        <Select
          dropdownId={'workflow-edit-manual-trigger-availability'}
          label={t`Available`}
          description={availabilityDescriptions[manualTriggerAvailability]}
          fullWidth
          disabled={triggerOptions.readonly}
          value={manualTriggerAvailability}
          options={MANUAL_TRIGGER_AVAILABILITY_OPTIONS}
          onChange={(updatedTriggerType) => {
            if (triggerOptions.readonly === true) {
              return;
            }

            triggerOptions.onTriggerUpdate({
              ...trigger,
              settings: getManualTriggerDefaultSettings({
                availability: updatedTriggerType,
                activeNonSystemObjectMetadataItems,
                icon: trigger.settings.icon,
              }),
            });
          }}
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />

        {manualTriggerAvailability === 'WHEN_RECORD_SELECTED' ? (
          <Select
            dropdownId={'workflow-edit-manual-trigger-object'}
            label={t`Object`}
            description={t`Will return one ${objectType} to the next step of this workflow`}
            fullWidth
            value={objectType}
            options={availableMetadata}
            disabled={triggerOptions.readonly}
            onChange={(updatedObject) => {
              if (triggerOptions.readonly === true) {
                return;
              }

              triggerOptions.onTriggerUpdate({
                ...trigger,
                settings: {
                  ...trigger.settings,
                  objectType: updatedObject,
                  outputSchema: {},
                },
              });
            }}
            dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          />
        ) : null}
        <IconPicker
          dropdownId={'workflow-edit-manual-trigger-icon'}
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
              <StyledLabel>{t`Command menu icon`}</StyledLabel>
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
      </WorkflowStepBody>
    </>
  );
};
