import { SettingsAppPreferencesListEmptyStateCard } from '@/settings/app-preferences/components/SettingsAppPreferencesListEmptyStateCard';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

type SettingsAccountGroupsEmptyStateProps = {
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAccountGroupsEmptyState = ({
  builtInAccountApp,
}: SettingsAccountGroupsEmptyStateProps) => {
  const { t } = useLingui();

  if (isDefined(builtInAccountApp)) {
    return (
      <SettingsAppPreferencesListEmptyStateCard
        provider={builtInAccountApp.provider}
      />
    );
  }

  return <StyledEmptyState>{t`No accounts yet`}</StyledEmptyState>;
};
