import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';

import { v4 } from 'uuid';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { OPTION_VALUE_MAXIMUM_LENGTH } from '@/settings/data-model/constants/OptionValueMaximumLength';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import {
  ColorSample,
  IconCheck,
  IconDotsVertical,
  IconGripVertical,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem, MenuItemSelectColor } from 'twenty-ui/navigation';
import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';

type SettingsServiceCenterSectorFieldSelectFormOptionRowProps = {
  className?: string;
  isDefault?: boolean;
  onChange: (value: FieldMetadataItemOption) => void;
  onRemove?: () => void;
  onInputEnter?: () => void;
  option: FieldMetadataItemOption;
};

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(1.5)} 0;
`;

const StyledColorSample = styled(ColorSample)`
  cursor: pointer;
  margin-left: 9px;
  margin-right: 14px;
`;

const StyledOptionInput = styled(TextInput)`
  flex: 1 0 auto;
  margin-right: ${({ theme }) => theme.spacing(2)};

  & input {
    height: ${({ theme }) => theme.spacing(6)};
  }
`;

export const SettingsServiceCenterSectorFieldSelectFormOptionRow = ({
  className,
  isDefault,
  onChange,
  onRemove,
  onInputEnter,
  option,
}: SettingsServiceCenterSectorFieldSelectFormOptionRowProps) => {
  const theme = useTheme();
  // const { t } = useTranslation();

  const dropdownIds = useMemo(() => {
    const baseScopeId = `select-field-option-row-${v4()}`;
    return {
      color: `${baseScopeId}-color`,
      actions: `${baseScopeId}-actions`,
    };
  }, []);

  const { closeDropdown: closeColorDropdown } = useDropdown(dropdownIds.color);
  const { closeDropdown: closeActionsDropdown } = useDropdown(
    dropdownIds.actions,
  );

  const handleInputEnter = () => {
    onInputEnter?.();
  };

  return (
    <StyledRow className={className}>
      <IconGripVertical
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
        color={theme.font.color.extraLight}
      />
      <Dropdown
        dropdownId={dropdownIds.color}
        dropdownPlacement="bottom-start"
        dropdownHotkeyScope={{
          scope: dropdownIds.color,
        }}
        clickableComponent={<StyledColorSample colorName={option.color} />}
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer>
              {MAIN_COLOR_NAMES.map((colorName) => (
                <MenuItemSelectColor
                  key={colorName}
                  onClick={() => {
                    onChange({ ...option, color: colorName });
                    closeColorDropdown();
                  }}
                  color={colorName}
                  selected={colorName === option.color}
                />
              ))}
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
      />
      <StyledOptionInput
        value={option.label}
        onChange={(label) =>
          onChange({
            ...option,
            label,
            value: label,
          })
        }
        RightIcon={isDefault ? IconCheck : undefined}
        maxLength={OPTION_VALUE_MAXIMUM_LENGTH}
        onInputEnter={handleInputEnter}
      />
      <Dropdown
        dropdownId={dropdownIds.actions}
        dropdownPlacement="right-start"
        dropdownHotkeyScope={{
          scope: dropdownIds.actions,
        }}
        clickableComponent={<LightIconButton Icon={IconDotsVertical} />}
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer>
              {!!onRemove && !isDefault && (
                <MenuItem
                  accent="danger"
                  LeftIcon={IconTrash}
                  text={'Remove topic'}
                  onClick={() => {
                    onRemove();
                    closeActionsDropdown();
                  }}
                />
              )}
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
      />
    </StyledRow>
  );
};
