import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { SettingsRow, type SettingsRowProps } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

type CommandMenuItemSwitchProps = {
  id: string;
  LeftIcon?: IconComponent;
  text: string;
  checked: boolean;
  onCheckedChange?: SettingsRowProps['onCheckedChange'];
  size?: SettingsRowProps['size'];
  disabled?: boolean;
  className?: string;
};

const StyledIconContainer = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  padding: ${themeCssVariables.spacing[1]};

  svg {
    height: ${themeCssVariables.icon.size.md}px;
    stroke-width: ${themeCssVariables.icon.stroke.sm};
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

export const CommandMenuItemSwitch = ({
  id,
  LeftIcon,
  text,
  checked,
  onCheckedChange,
  size = 'md',
  disabled = false,
  className,
}: CommandMenuItemSwitchProps) => {
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    id,
  );

  return (
    <SettingsRow
      className={className}
      focused={isSelectedItemId}
      disabled={disabled}
      startIcon={
        isDefined(LeftIcon) && (
          <StyledIconContainer>
            <LeftIcon />
          </StyledIconContainer>
        )
      }
      checked={checked}
      onCheckedChange={onCheckedChange}
      size={size}
    >
      {text}
    </SettingsRow>
  );
};
