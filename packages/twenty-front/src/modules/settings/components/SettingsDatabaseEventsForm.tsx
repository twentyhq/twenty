import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBox,
  IconNorthStar,
  IconPlus,
  IconTrash,
  useIcons,
} from 'twenty-ui/display';
import { IconButton, type SelectOption } from 'twenty-ui/input';

const OBJECT_DROPDOWN_WIDTH = 240;
const ACTION_DROPDOWN_WIDTH = 240;
const OBJECT_MOBILE_WIDTH = 150;
const ACTION_MOBILE_WIDTH = 140;

const StyledFilterRow = styled.div<{ isMobile: boolean }>`
  display: grid;
  grid-template-columns: ${({ isMobile }) =>
    isMobile
      ? `${OBJECT_MOBILE_WIDTH}px ${ACTION_MOBILE_WIDTH}px auto`
      : `${OBJECT_DROPDOWN_WIDTH}px ${ACTION_DROPDOWN_WIDTH}px auto`};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  align-items: center;
`;

const StyledPlaceholder = styled.div`
  height: ${({ theme }) => theme.spacing(8)};
  width: ${({ theme }) => theme.spacing(8)};
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
  const isMobile = useIsMobile();

  const { objectMetadataItems } = useObjectMetadataItems();

  const { getIcon } = useIcons();

  const objectOptions: SelectOption<string>[] = [
    { label: t`All Objects`, value: '*', Icon: IconNorthStar },
    ...objectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
      Icon: getIcon(item.icon),
    })),
  ];

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
        <StyledFilterRow key={index} isMobile={isMobile}>
          <Select
            dropdownId={`object-webhook-type-select-${index}`}
            value={operation.object}
            options={objectOptions}
            onChange={(newValue) =>
              updateOperation?.(index, 'object', newValue)
            }
            fullWidth
            emptyOption={{ label: t`Object`, value: null }}
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
              Icon={IconTrash}
              variant="tertiary"
              size="medium"
              onClick={() => removeOperation?.(index)}
            />
          ) : (
            <StyledPlaceholder />
          )}
        </StyledFilterRow>
      ))}
    </>
  );
};
