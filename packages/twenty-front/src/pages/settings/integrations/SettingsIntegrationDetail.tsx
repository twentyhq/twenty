import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SETTINGS_INTEGRATION_ALL_CATEGORY } from '~/pages/settings/integrations/constants/SettingsIntegrationAll';

export const SettingsIntegrationDetail = () => {
  const { integrationKey = '' } = useParams();
  const navigate = useNavigate();
  const integrationLabel = SETTINGS_INTEGRATION_ALL_CATEGORY.integrations.find(
    ({ from: { key } }) => key === integrationKey,
  )?.text;

  const isAirtableIntegrationEnabled = useIsFeatureEnabled(
    'IS_AIRTABLE_INTEGRATION_ENABLED',
  );
  const isPostgresqlIntegrationEnabled = useIsFeatureEnabled(
    'IS_POSTGRESQL_INTEGRATION_ENABLED',
  );
  const isIntegrationAvailable =
    (integrationKey === 'airtable' && isAirtableIntegrationEnabled) ||
    (integrationKey === 'postgresql' && isPostgresqlIntegrationEnabled);

  useEffect(() => {
    if (!integrationLabel || !isIntegrationAvailable) {
      return navigate(AppPath.NotFound);
    }
  }, [
    integrationLabel,
    integrationKey,
    isAirtableIntegrationEnabled,
    isIntegrationAvailable,
    isPostgresqlIntegrationEnabled,
    navigate,
  ]);

  if (!integrationLabel || !isIntegrationAvailable) return null;

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Integrations', href: '/settings/integrations' },
            { children: integrationLabel },
          ]}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
