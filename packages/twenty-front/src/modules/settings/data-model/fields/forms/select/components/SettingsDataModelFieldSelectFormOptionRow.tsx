import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { OPTION_VALUE_MAXIMUM_LENGTH } from '@/settings/data-model/constants/OptionValueMaximumLength';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  Dropdown,
  LightIconButton,
  type ColorLabels,
} from 'twenty-ui/components';
import {
  IconCheck,
  IconDotsVertical,
  IconGripVertical,
  IconTrash,
  IconX,
} from 'twenty-ui/icon';
import { ColorSample } from 'twenty-ui/primitives/data-display';
import { MAIN_COLOR_NAMES, useTheme, themeCssVariables } from 'twenty-ui/theme';

import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/computeOptionValueFromLabel';

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
  min-height: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing['1.5']} 0;
`;

const StyledColorSampleContainer = styled.span`
  align-items: center;
  cursor: pointer;
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[1]};
  margin-left: 14px;
  margin-right: 14px;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledOptionInputContainer = styled.div`
  flex-grow: 1;
  width: 100%;

  & input {
    height: ${themeCssVariables.spacing[6]};
  }
`;

const StyledIconGripVerticalContainer = styled.span`
  align-items: center;
  display: flex;
  margin-right: 3px;
`;

const StyledLightIconButtonContainer = styled.span`
  align-items: center;
  display: flex;
  margin-left: ${themeCssVariables.spacing[2]};
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
  const theme = useTheme();
  const colorLabels = useColorLabels();
  const SELECT_COLOR_DROPDOWN_ID = `select-color-dropdown-${option.id}`;
  const SELECT_ACTIONS_DROPDOWN_ID = `select-actions-dropdown-${option.id}`;

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
      <DropdownRoot dropdownId={SELECT_COLOR_DROPDOWN_ID} type="picker">
        <Dropdown.Trigger
          render={<StyledColorSampleContainer />}
          nativeButton={false}
          aria-label={t`Color`}
        >
          <ColorSample colorName={option.color} />
        </Dropdown.Trigger>
        <DropdownContent align="start">
          <Dropdown.Section>
            {MAIN_COLOR_NAMES.map((colorName) => (
              <Dropdown.OptionItem
                key={colorName}
                selected={colorName === option.color}
                onSelect={() => onChange({ ...option, color: colorName })}
                startIcon={<ColorSample colorName={colorName} />}
              >
                {colorLabels[colorName]}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
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
      <DropdownRoot dropdownId={SELECT_ACTIONS_DROPDOWN_ID} type="menu">
        <StyledLightIconButtonContainer>
          <Dropdown.Trigger
            disabled={shouldForbidRemoveAsDefault}
            render={
              <LightIconButton
                emphasis="subtle"
                disabled={shouldForbidRemoveAsDefault}
                aria-label={t`More options`}
              >
                <IconDotsVertical />
              </LightIconButton>
            }
          />
        </StyledLightIconButtonContainer>
        <DropdownContent side="right" align="start">
          <Dropdown.Section>
            {isDefault ? (
              <Dropdown.ActionItem
                startIcon={<IconX />}
                onClick={() => onRemoveAsDefault?.()}
              >{t`Remove as default`}</Dropdown.ActionItem>
            ) : (
              <Dropdown.ActionItem
                startIcon={<IconCheck />}
                onClick={() => onSetAsDefault?.()}
              >{t`Set as default`}</Dropdown.ActionItem>
            )}
            {isDefined(onRemove) && !isDefault && (
              <Dropdown.ActionItem
                color="danger"
                startIcon={<IconTrash />}
                onClick={() => onRemove()}
              >{t`Remove option`}</Dropdown.ActionItem>
            )}
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
    </StyledRow>
  );
};
