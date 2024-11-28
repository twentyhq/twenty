import { SettingsAdminImpersonateUsers } from '@/settings/admin-panel/components/SettingsAdminImpersonateUsers';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import { IconFlag, UndecoratedLink } from 'twenty-ui';

export const SettingsAdmin = () => {
  const theme = useTheme();
  return (
    <SubMenuTopBarContainer
      title="Server Admin Panel"
      links={[
        {
          children: 'Other',
          href: getSettingsPagePath(SettingsPath.AdminPanel),
        },
        { children: 'Server Admin Panel' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAdminImpersonateUsers />
        <UndecoratedLink to={getSettingsPagePath(SettingsPath.FeatureFlags)}>
          <SettingsCard
            Icon={
              <IconFlag
                size={theme.icon.size.lg}
                stroke={theme.icon.stroke.sm}
              />
            }
            title="Feature Flags"
          />
        </UndecoratedLink>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
