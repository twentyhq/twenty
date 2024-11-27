import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { OPTION_VALUE_MAXIMUM_LENGTH } from '@/settings/data-model/constants/OptionValueMaximumLength';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import {
  ColorSample,
  IconCheck,
  IconDotsVertical,
  IconGripVertical,
  IconTrash,
  IconX,
  LightIconButton,
  MAIN_COLOR_NAMES,
  MenuItem,
  MenuItemSelectColor,
} from 'twenty-ui';
import { v4 } from 'uuid';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

type SettingsDataModelFieldSelectFormOptionRowProps = {
  className?: string;
  isDefault?: boolean;
  onChange: (value: FieldMetadataItemOption) => void;
  onRemove?: () => void;
  onSetAsDefault?: () => void;
  onRemoveAsDefault?: () => void;
  onInputEnter?: () => void;
  option: FieldMetadataItemOption;
  isNewRow?: boolean;
};

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(1.5)} 0;
`;

const StyledColorSample = styled(ColorSample)`
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};

  margin-right: ${({ theme }) => theme.spacing(3.5)};
  margin-left: ${({ theme }) => theme.spacing(3.5)};
`;

const StyledOptionInput = styled(TextInput)`
  flex-grow: 1;
  width: 100%;
  & input {
    height: ${({ theme }) => theme.spacing(6)};
  }
`;

const StyledIconGripVertical = styled(IconGripVertical)`
  margin-right: ${({ theme }) => theme.spacing(0.75)};
`;

const StyledLightIconButton = styled(LightIconButton)`
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDataModelFieldSelectFormOptionRow = ({
  className,
  isDefault,
  onChange,
  onRemove,
  onSetAsDefault,
  onRemoveAsDefault,
  onInputEnter,
  option,
  isNewRow,
}: SettingsDataModelFieldSelectFormOptionRowProps) => {
  const theme = useTheme();

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
      <StyledIconGripVertical
        style={{ minWidth: theme.icon.size.md }}
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
        color={theme.font.color.extraLight}
      />
      <AdvancedSettingsWrapper dimension="width" hideIcon={true}>
        <StyledOptionInput
          value={option.value}
          onChange={(input) =>
            onChange({
              ...option,
              value: computeOptionValueFromLabel(input),
            })
          }
          RightIcon={isDefault ? IconCheck : undefined}
          maxLength={OPTION_VALUE_MAXIMUM_LENGTH}
        />
      </AdvancedSettingsWrapper>
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
        onChange={(label) => {
          const optionNameHasBeenEdited = !(
            option.value === computeOptionValueFromLabel(option.label)
          );
          onChange({
            ...option,
            label,
            value: optionNameHasBeenEdited
              ? option.value
              : computeOptionValueFromLabel(label),
          });
        }}
        RightIcon={isDefault ? IconCheck : undefined}
        maxLength={OPTION_VALUE_MAXIMUM_LENGTH}
        onInputEnter={handleInputEnter}
        autoFocusOnMount={isNewRow}
        autoSelectOnMount={isNewRow}
      />
      <Dropdown
        dropdownId={dropdownIds.actions}
        dropdownPlacement="right-start"
        dropdownHotkeyScope={{
          scope: dropdownIds.actions,
        }}
        clickableComponent={
          <StyledLightIconButton accent="tertiary" Icon={IconDotsVertical} />
        }
        dropdownComponents={
          <DropdownMenu>
            <DropdownMenuItemsContainer>
              {isDefault ? (
                <MenuItem
                  LeftIcon={IconX}
                  text="Remove as default"
                  onClick={() => {
                    onRemoveAsDefault?.();
                    closeActionsDropdown();
                  }}
                />
              ) : (
                <MenuItem
                  LeftIcon={IconCheck}
                  text="Set as default"
                  onClick={() => {
                    onSetAsDefault?.();
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
