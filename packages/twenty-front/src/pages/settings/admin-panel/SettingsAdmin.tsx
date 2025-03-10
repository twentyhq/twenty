import { SettingsAdminContent } from '@/settings/admin-panel/components/SettingsAdminContent';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAdmin = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Server Admin`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.ServerAdmin),
        },
        { children: t`Server Admin` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAdminContent />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
