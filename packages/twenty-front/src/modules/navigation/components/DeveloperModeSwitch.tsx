import { useDeveloperModeTypingLine } from '@/navigation/hooks/useDeveloperModeTypingLine';
import { NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerCollapsedButtonSize';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
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
  justify-content: ${({ isCompact }) => (isCompact ? 'center' : 'flex-start')};
  min-height: ${({ isCompact }) =>
    isCompact
      ? `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px`
      : themeCssVariables.spacing[7]};
  padding: ${({ isCompact }) =>
    isCompact ? '0' : themeCssVariables.spacing[1]};
  width: ${({ isCompact }) =>
    isCompact ? `${NAVIGATION_DRAWER_COLLAPSED_BUTTON_SIZE}px` : '100%'};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTypedLine = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${themeCssVariables.font.size.xs};
  gap: 1px;
  height: ${themeCssVariables.spacing[4]};
  white-space: pre;
`;

const StyledCaret = styled.span`
  animation: developer-mode-caret-blink 1.06s steps(1) infinite;
  background: ${themeCssVariables.accent.accent9};
  border-radius: 1px;
  flex-shrink: 0;
  height: 10px;
  width: 2px;

  @keyframes developer-mode-caret-blink {
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
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
  const { t } = useLingui();
  const theme = useTheme();
  const instanceId = useId();
  const labelId = `${instanceId}-text`;
  const label = t`Developer mode`;
  const { line, startTyping, stopTyping } =
    useDeveloperModeTypingLine(isEnabled);

  const handleCheckedChange = (checked: boolean) => {
    onEnabledChange(checked);

    if (checked) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <StyledContainer
      htmlFor={instanceId}
      isCompact={isCompact}
      title={isCompact ? label : undefined}
    >
      {!isCompact && (
        <>
          <IconCode
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
            color={theme.font.color.tertiary}
          />
          <StyledText>
            <StyledTitle id={labelId}>{label}</StyledTitle>
            {isDefined(line) && (
              <StyledTypedLine aria-hidden>
                {line}
                <StyledCaret />
              </StyledTypedLine>
            )}
          </StyledText>
        </>
      )}
      <Switch
        id={instanceId}
        aria-label={isCompact ? label : undefined}
        aria-labelledby={isCompact ? undefined : labelId}
        checked={isEnabled}
        onCheckedChange={handleCheckedChange}
      />
    </StyledContainer>
  );
};
