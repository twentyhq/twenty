import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationGroup } from '@/settings/integrations/components/SettingsIntegrationGroup';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';

export const SettingsIntegrations = () => {
  const integrationCategories = useSettingsIntegrationCategories();

  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={t('integrations')}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: t('integrations') },
      ]}
    >
      <SettingsPageContainer>
        {integrationCategories.map((group) => (
          <SettingsIntegrationGroup key={group.key} integrationGroup={group} />
        ))}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
