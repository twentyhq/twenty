import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconAppWindow } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type SystemNotificationSettings } from '@/web-push/types/SystemNotificationSettings';

type SystemNotificationSettingsIllustrationRow = {
  label: string;
  isOn: boolean;
  isHighlighted: boolean;
  hasAppIcon: boolean;
};

type SystemNotificationSettingsIllustrationProps = {
  operatingSystem: Exclude<
    SystemNotificationSettings['operatingSystem'],
    'other'
  >;
  settingsEntryName: string;
};

const StyledWindow = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledWindowTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTrafficLights = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTrafficLight = styled.span`
  background: ${themeCssVariables.border.color.strong};
  border-radius: 50%;
  height: ${themeCssVariables.spacing[2]};
  width: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div<{ isHighlighted: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid
    ${({ isHighlighted }) =>
      isHighlighted
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${({ isHighlighted }) =>
    isHighlighted ? `0 0 0 3px ${themeCssVariables.color.blue3}` : 'none'};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledRowLabel = styled.span`
  flex: 1;
`;

export const SystemNotificationSettingsIllustration = ({
  operatingSystem,
  settingsEntryName,
}: SystemNotificationSettingsIllustrationProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const rowsByOperatingSystem: Record<
    SystemNotificationSettingsIllustrationProps['operatingSystem'],
    SystemNotificationSettingsIllustrationRow[]
  > = {
    mac: [
      {
        label: t`Allow notifications`,
        isOn: true,
        isHighlighted: true,
        hasAppIcon: false,
      },
    ],
    windows: [
      {
        label: t`Notifications`,
        isOn: true,
        isHighlighted: false,
        hasAppIcon: false,
      },
      {
        label: t`Do not disturb`,
        isOn: false,
        isHighlighted: false,
        hasAppIcon: false,
      },
      {
        label: settingsEntryName,
        isOn: true,
        isHighlighted: true,
        hasAppIcon: true,
      },
    ],
  };

  return (
    <StyledWindow aria-hidden>
      <StyledWindowTitle>
        {operatingSystem === 'mac' && (
          <StyledTrafficLights>
            <StyledTrafficLight />
            <StyledTrafficLight />
            <StyledTrafficLight />
          </StyledTrafficLights>
        )}
        {operatingSystem === 'mac'
          ? t`Notifications › ${settingsEntryName}`
          : t`System › Notifications`}
      </StyledWindowTitle>
      {rowsByOperatingSystem[operatingSystem].map(
        ({ label, isOn, isHighlighted, hasAppIcon }) => (
          <StyledRow key={label} isHighlighted={isHighlighted}>
            {hasAppIcon && <IconAppWindow size={theme.icon.size.md} />}
            <StyledRowLabel>{label}</StyledRowLabel>
            <Switch checked={isOn} readOnly size="sm" tabIndex={-1} />
          </StyledRow>
        ),
      )}
    </StyledWindow>
  );
};
