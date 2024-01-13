import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { v4 } from 'uuid';

import { ColorSample } from '@/ui/display/color/components/ColorSample';
import {
  IconCheck,
  IconDotsVertical,
  IconGripVertical,
  IconTrash,
  IconX,
} from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelectColor } from '@/ui/navigation/menu-item/components/MenuItemSelectColor';
import { mainColorNames } from '@/ui/theme/constants/colors';

import { SettingsObjectFieldPipelineStepsFormOption } from '../types/SettingsObjectFieldPipelineStepsFormOption';

type SettingsObjectFieldPipelineStepsFormOptionRowProps = {
  className?: string;
  isDefault?: boolean;
  onChange: (value: SettingsObjectFieldPipelineStepsFormOption) => void;
  onRemove?: () => void;
  option: SettingsObjectFieldPipelineStepsFormOption;
  index: number;
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

const StyledOptionRowNumber = styled.div`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: 13px;
  font-weight: 500;
  margin-left: 8px;
  margin-right: 8px;
`;

const StyledOptionInput = styled(TextInput)`
  flex: 1 0 auto;
  margin-right: ${({ theme }) => theme.spacing(2)};

  & input {
    height: ${({ theme }) => theme.spacing(2)};
  }
`;

export const SettingsObjectFieldPipelineStepsFormOptionRow = ({
  className,
  isDefault,
  onChange,
  onRemove,
  option,
  index,
}: SettingsObjectFieldPipelineStepsFormOptionRowProps) => {
  const theme = useTheme();

  const dropdownIds = useMemo(() => {
    const baseScopeId = `pipelinesteps-field-option-row-${v4()}`;
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
      <StyledOptionRowNumber>{index + 1}</StyledOptionRowNumber>
      <Dropdown
        dropdownId={dropdownIds.color}
        dropdownPlacement="bottom-start"
        dropdownHotkeyScope={{
          scope: dropdownIds.color,
        }}
        clickableComponent={
          <StyledColorSample colorName={option.color} variant="pipeline" />
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer>
              {mainColorNames.map((colorName) => (
                <MenuItemSelectColor
                  key={colorName}
                  onClick={() => {
                    onChange({ ...option, color: colorName });
                    closeColorDropdown();
                  }}
                  color={colorName}
                  selected={colorName === option.color}
                  variant="pipeline"
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
              {!!onRemove && (
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
