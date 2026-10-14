import { WebhookEntitySelect } from '@/settings/developers/components/WebhookEntitySelect';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBox, IconNorthStar, IconPlus, IconTrash } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { IconButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

const OBJECT_MIN_WIDTH = 150;
const ACTION_MIN_WIDTH = 140;
const ACTION_MAX_WIDTH = 240;

const StyledFilterRow = styled.div`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns:
    minmax(${OBJECT_MIN_WIDTH}px, 1fr)
    minmax(${ACTION_MIN_WIDTH}px, ${ACTION_MAX_WIDTH}px)
    ${themeCssVariables.spacing[8]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledPlaceholder = styled.div`
  height: ${themeCssVariables.spacing[8]};
  width: ${themeCssVariables.spacing[8]};
`;

export const SettingsDatabaseEventsForm = ({
  events,
  updateOperation,
  removeOperation,
  disabled = false,
}: {
  events: { object: string | null; action: string; updatedFields?: string[] }[];
  updateOperation?: (
    index: number,
    field: 'object' | 'action',
    value: string | null,
  ) => void;
  removeOperation?: (index: number) => void;
  disabled?: boolean;
}) => {
  const getActionOptions = (
    updatedFields?: string[],
  ): SelectOption<string>[] => {
    const hasSpecificFields =
      isDefined(updatedFields) && updatedFields.length > 0;

    return [
      { label: t`All`, value: '*', Icon: IconNorthStar },
      { label: t`Created`, value: 'created', Icon: IconPlus },
      {
        label: hasSpecificFields ? t`Updated (on specific fields)` : t`Updated`,
        value: 'updated',
        Icon: IconBox,
      },
      { label: t`Deleted`, value: 'deleted', Icon: IconTrash },
    ];
  };

  return (
    <>
      {events.map((operation, index) => (
        <StyledFilterRow key={index}>
          <WebhookEntitySelect
            dropdownId={`object-webhook-type-select-${index}`}
            value={operation.object}
            onChange={(newValue) =>
              updateOperation?.(index, 'object', newValue)
            }
            disabled={disabled}
          />
          <Select
            dropdownId={`operation-webhook-type-select-${index}`}
            value={operation.action}
            options={getActionOptions(operation.updatedFields)}
            onChange={(newValue) =>
              updateOperation?.(index, 'action', newValue)
            }
            fullWidth
            disabled={disabled}
          />
          {isDefined(operation.object) && !disabled ? (
            <IconButton
              variant="ghost"
              size="md"
              aria-label={t`Remove filter`}
              onClick={() => removeOperation?.(index)}
            >
              <IconTrash />
            </IconButton>
          ) : (
            <StyledPlaceholder />
          )}
        </StyledFilterRow>
      ))}
    </>
  );
};
