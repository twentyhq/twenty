import { SettingsAdminContent } from '@/settings/admin-panel/components/SettingsAdminContent';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';

export const SettingsAdmin = () => {
  const { t } = useTranslation();
  return (
    <SubMenuTopBarContainer
      title={t('serverAdminPanel')}
      links={[
        {
          children: t('other'),
          href: getSettingsPagePath(SettingsPath.AdminPanel),
        },
        { children: t('serverAdminPanel') },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAdminContent />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
