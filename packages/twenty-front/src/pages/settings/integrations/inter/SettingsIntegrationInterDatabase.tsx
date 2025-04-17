import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationInterDatabaseConectionsListCard } from '@/settings/integrations/inter/components/SettingsIntegrationInterDatabaseConectionsListCard';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useEffect } from 'react';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsIntegrationInterDatabase = () => {
  const navigateApp = useNavigateApp();
  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'inter',
  );

  const isIntegrationAvailable = !!integration;

  console.log('OPAA', isIntegrationAvailable);

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
  }, [integration, isIntegrationAvailable, navigateApp]);

  if (!isIntegrationAvailable) return null;

  return (
    <SubMenuTopBarContainer
      title="Banco Inter"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: getSettingsPath(SettingsPath.Integrations),
        },
        { children: 'Inter' },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationPreview
          integrationLogoUrl={integration.from.image}
        />
        <SettingsIntegrationInterDatabaseConectionsListCard
          integration={integration}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
