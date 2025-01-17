import { useLingui } from '@lingui/react/macro';

import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsNewAccount = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`New Account`}
      links={[
        {
          children: t`User`,
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPagePath(SettingsPath.Accounts),
        },
        { children: t`New` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsNewAccountSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
