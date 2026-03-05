import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { OPTION_VALUE_MAXIMUM_LENGTH } from '@/settings/data-model/constants/OptionValueMaximumLength';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { t } from '@lingui/core/macro';
import {
  ColorSample,
  IconCheck,
  IconDotsVertical,
  IconGripVertical,
  IconTrash,
  IconX,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import {
  type ColorLabels,
  MenuItem,
  MenuItemSelectColor,
} from 'twenty-ui/navigation';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/computeOptionValueFromLabel';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';

const useColorLabels = (): ColorLabels => ({
  gray: t`Gray`,
  tomato: t`Tomato`,
  red: t`Red`,
  ruby: t`Ruby`,
  crimson: t`Crimson`,
  pink: t`Pink`,
  plum: t`Plum`,
  purple: t`Purple`,
  violet: t`Violet`,
  iris: t`Iris`,
  cyan: t`Cyan`,
  turquoise: t`Turquoise`,
  sky: t`Sky`,
  blue: t`Blue`,
  jade: t`Jade`,
  green: t`Green`,
  grass: t`Grass`,
  mint: t`Mint`,
  lime: t`Lime`,
  bronze: t`Bronze`,
  gold: t`Gold`,
  brown: t`Brown`,
  orange: t`Orange`,
  amber: t`Amber`,
  yellow: t`Yellow`,
});

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
  fieldIsNullable?: boolean;
};

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing['1.5']} 0;
`;

const StyledColorSampleContainer = styled.span`
  cursor: pointer;
  margin-top: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[1]};
  margin-right: 14px;
  margin-left: 14px;
  display: flex;
  align-items: center;
`;

const StyledOptionInputContainer = styled.div`
  flex-grow: 1;
  width: 100%;

  & input {
    height: ${themeCssVariables.spacing[6]};
  }
`;

const StyledIconGripVerticalContainer = styled.span`
  margin-right: 3px;
  display: flex;
  align-items: center;
`;

const StyledLightIconButtonContainer = styled.span`
  margin-left: ${themeCssVariables.spacing[2]};
  display: flex;
  align-items: center;
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
  fieldIsNullable,
}: SettingsDataModelFieldSelectFormOptionRowProps) => {
  const { theme } = useContext(ThemeContext);
  const colorLabels = useColorLabels();
  const SELECT_COLOR_DROPDOWN_ID = `select-color-dropdown-${option.id}`;
  const SELECT_ACTIONS_DROPDOWN_ID = `select-actions-dropdown-${option.id}`;

  const { closeDropdown: closeColorDropdown } = useCloseDropdown();
  const { closeDropdown: closeActionsDropdown } = useCloseDropdown();

  const shouldForbidRemoveAsDefault = isDefault && !fieldIsNullable;

  const handleInputEnter = () => {
    onInputEnter?.();
  };

  return (
    <StyledRow className={className}>
      <StyledIconGripVerticalContainer>
        <IconGripVertical
          style={{
            minWidth: theme.icon.size.md,
          }}
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.extraLight}
        />
      </StyledIconGripVerticalContainer>
      <AdvancedSettingsWrapper animationDimension="width" hideDot>
        <StyledOptionInputContainer>
          <SettingsTextInput
            instanceId={`select-option-value-${option.id}`}
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
        </StyledOptionInputContainer>
      </AdvancedSettingsWrapper>
      <Dropdown
        dropdownId={SELECT_COLOR_DROPDOWN_ID}
        dropdownPlacement="bottom-start"
        clickableComponent={
          <StyledColorSampleContainer>
            <ColorSample colorName={option.color} />
          </StyledColorSampleContainer>
        }
        dropdownComponents={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {MAIN_COLOR_NAMES.map((colorName) => (
                <MenuItemSelectColor
                  key={colorName}
                  onClick={() => {
                    onChange({ ...option, color: colorName });
                    closeColorDropdown(SELECT_COLOR_DROPDOWN_ID);
                  }}
                  color={colorName}
                  selected={colorName === option.color}
                  colorLabels={colorLabels}
                />
              ))}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
      <StyledOptionInputContainer>
        <SettingsTextInput
          instanceId={`select-option-label-${option.id}`}
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
      </StyledOptionInputContainer>
      <Dropdown
        dropdownId={SELECT_ACTIONS_DROPDOWN_ID}
        dropdownPlacement="right-start"
        clickableComponent={
          <StyledLightIconButtonContainer>
            <LightIconButton
              accent="tertiary"
              Icon={IconDotsVertical}
              disabled={shouldForbidRemoveAsDefault}
            />
          </StyledLightIconButtonContainer>
        }
        dropdownComponents={
          shouldForbidRemoveAsDefault ? null : (
            <DropdownContent>
              <DropdownMenuItemsContainer>
                {isDefault ? (
                  <MenuItem
                    LeftIcon={IconX}
                    text={t`Remove as default`}
                    onClick={() => {
                      onRemoveAsDefault?.();
                      closeActionsDropdown(SELECT_ACTIONS_DROPDOWN_ID);
                    }}
                  />
                ) : (
                  <MenuItem
                    LeftIcon={IconCheck}
                    text={t`Set as default`}
                    onClick={() => {
                      onSetAsDefault?.();
                      closeActionsDropdown(SELECT_ACTIONS_DROPDOWN_ID);
                    }}
                  />
                )}
                {!!onRemove && !isDefault && (
                  <MenuItem
                    accent="danger"
                    LeftIcon={IconTrash}
                    text={t`Remove option`}
                    onClick={() => {
                      onRemove();
                      closeActionsDropdown(SELECT_ACTIONS_DROPDOWN_ID);
                    }}
                  />
                )}
              </DropdownMenuItemsContainer>
            </DropdownContent>
          )
        }
      />
    </StyledRow>
  );
};
