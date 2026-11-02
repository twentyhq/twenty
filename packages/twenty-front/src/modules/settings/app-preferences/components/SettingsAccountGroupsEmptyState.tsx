import { SettingsApplicationConnectCards } from '@/settings/app-preferences/components/SettingsApplicationConnectCards';
import { useAddBuiltInAccount } from '@/settings/app-preferences/hooks/useAddBuiltInAccount';
import { useEnabledBuiltInAccountApps } from '@/settings/app-preferences/hooks/useEnabledBuiltInAccountApps';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsAccountGroupsEmptyStateProps = {
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAccountGroupsEmptyState = ({
  builtInAccountApp,
}: SettingsAccountGroupsEmptyStateProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enabledBuiltInAccountApps } = useEnabledBuiltInAccountApps();
  const { addBuiltInAccount } = useAddBuiltInAccount();

  const builtInAccountApps = isDefined(builtInAccountApp)
    ? [builtInAccountApp]
    : enabledBuiltInAccountApps;

  return (
    <StyledCardsContainer>
      {builtInAccountApps.map((app) => {
        const appName = t(app.name);

        return (
          <SettingsCard
            key={app.id}
            Icon={<app.Icon size={theme.icon.size.md} />}
            title={t`Connect with ${appName}`}
            onClick={() => addBuiltInAccount(app)}
          />
        );
      })}
      {!isDefined(builtInAccountApp) && <SettingsApplicationConnectCards />}
    </StyledCardsContainer>
  );
};
