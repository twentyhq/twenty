import { AppChip } from '@/applications/components/AppChip';
import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type AppPreferencesApp } from '@/settings/app-preferences/types/AppPreferencesApp';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsAppPreferencesAppNameCellProps = {
  item: AppPreferencesApp;
};

export const SettingsAppPreferencesAppNameCell = ({
  item,
}: SettingsAppPreferencesAppNameCellProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { to, icon, name } =
    item.type === 'native'
      ? {
          to: getSettingsPath(SettingsPath.NativeAccountApp, {
            nativeAccountAppId: item.nativeAccountApp.id,
          }),
          icon: <item.nativeAccountApp.Icon size={theme.icon.size.md} />,
          name: t(item.nativeAccountApp.name),
        }
      : {
          to: getSettingsPath(SettingsPath.ApplicationPreferences, {
            applicationId: item.applicationWithPreferences.application.id,
          }),
          icon: (
            <AppChip
              applicationId={item.applicationWithPreferences.application.id}
              size="md"
              chipOnly
            />
          ),
          name: getApplicationDisplayName({
            application: item.applicationWithPreferences.application,
            currentWorkspace,
          }),
        };

  return (
    <UndecoratedLink to={to} onClick={(event) => event.stopPropagation()}>
      <StyledNameCell>
        {icon}
        {name}
      </StyledNameCell>
    </UndecoratedLink>
  );
};
