import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconCheck,
  IconDotsVertical,
  IconGripVertical,
  IconTrash,
  IconX,
} from 'twenty-ui';
import { v4 } from 'uuid';

import { ColorSample } from '@/ui/display/color/components/ColorSample';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelectColor } from '@/ui/navigation/menu-item/components/MenuItemSelectColor';
import { MAIN_COLOR_NAMES } from '@/ui/theme/constants/MainColorNames';

import { SettingsObjectFieldSelectFormOption } from '../types/SettingsObjectFieldSelectFormOption';

type SettingsObjectFieldSelectFormOptionRowProps = {
  className?: string;
  isDefault?: boolean;
  onChange: (value: SettingsObjectFieldSelectFormOption) => void;
  onRemove?: () => void;
  option: SettingsObjectFieldSelectFormOption;
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

export const SettingsObjectFieldSelectFormOptionRow = ({
  className,
  isDefault,
  onChange,
  onRemove,
  option,
}: SettingsObjectFieldSelectFormOptionRowProps) => {
  const theme = useTheme();

  const dropdownIds = useMemo(() => {
    const baseScopeId = `select-field-option-row-${v4()}`;
    return { color: `${baseScopeId}-color`, actions: `${baseScopeId}-actions` };
  }, []);

  const { closeDropdown: closeColorDropdown } = useDropdown(dropdownIds.color);
  const { closeDropdown: closeActionsDropdown } = useDropdown(
    dropdownIds.actions,
  );

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
        onChange={(label) => onChange({ ...option, label })}
        RightIcon={isDefault ? IconCheck : undefined}
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
              {isDefault ? (
                <MenuItem
                  LeftIcon={IconX}
                  text="Remove as default"
                  onClick={() => {
                    onChange({ ...option, isDefault: false });
                    closeActionsDropdown();
                  }}
                />
              ) : (
                <MenuItem
                  LeftIcon={IconCheck}
                  text="Set as default"
                  onClick={() => {
                    onChange({ ...option, isDefault: true });
                    closeActionsDropdown();
                  }}
                />
              )}
              {!!onRemove && !isDefault && (
                <MenuItem
                  accent="danger"
                  LeftIcon={IconTrash}
                  text="Remove option"
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
