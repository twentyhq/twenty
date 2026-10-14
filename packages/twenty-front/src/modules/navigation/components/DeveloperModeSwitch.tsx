import { DeveloperModeSwitchLabel } from '@/navigation/components/DeveloperModeSwitchLabel';
import { DeveloperModeTypingEffect } from '@/navigation/components/DeveloperModeTypingEffect';
import { useDeveloperModeTypingSequence } from '@/navigation/hooks/useDeveloperModeTypingSequence';
import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { styled } from '@linaria/react';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCode } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.label<{ isCompact: boolean }>`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${({ isCompact }) =>
    isCompact
      ? `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`
      : themeCssVariables.spacing[7]};
  justify-content: ${({ isCompact }) => (isCompact ? 'center' : 'flex-start')};
  padding: ${({ isCompact }) =>
    isCompact ? '0' : themeCssVariables.spacing[1]};
  width: ${({ isCompact }) =>
    isCompact ? `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px` : '100%'};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

type DeveloperModeSwitchProps = {
  isEnabled: boolean;
  onEnabledChange: (isEnabled: boolean) => void;
  isCompact?: boolean;
};

export const DeveloperModeSwitch = ({
  isEnabled,
  onEnabledChange,
  isCompact = false,
}: DeveloperModeSwitchProps) => {
  const theme = useTheme();
  const instanceId = useId();
  const {
    label,
    sequence,
    setSequence,
    displayedFrame,
    isTyping,
    playEnterSequence,
    playExitSequence,
  } = useDeveloperModeTypingSequence(isEnabled);

  const handleCheckedChange = (checked: boolean) => {
    onEnabledChange(checked);

    if (checked) {
      playEnterSequence();
      return;
    }

    playExitSequence();
  };

  return (
    <StyledContainer
      htmlFor={instanceId}
      isCompact={isCompact}
      title={isCompact ? label : undefined}
    >
      {isDefined(sequence) && (
        <DeveloperModeTypingEffect
          sequence={sequence}
          onSequenceChange={setSequence}
        />
      )}
      {!isCompact && (
        <>
          <IconCode
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={isEnabled ? theme.accent.accent9 : theme.font.color.tertiary}
          />
          <DeveloperModeSwitchLabel
            label={label}
            frame={displayedFrame}
            isTyping={isTyping}
          />
        </>
      )}
      <Switch
        id={instanceId}
        aria-label={label}
        checked={isEnabled}
        onCheckedChange={handleCheckedChange}
      />
    </StyledContainer>
  );
};
