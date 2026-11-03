import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { useOpenAdminConsole } from '@/settings/admin-panel/admin-console/hooks/useOpenAdminConsole';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { Section } from 'twenty-ui/components/layout';
import { IconServer } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

export const SettingsAdminConsoleLink = () => {
  const { openAdminConsole, isOpeningAdminConsole } = useOpenAdminConsole();

  return (
    <SettingsPageLayout
      title={t`Admin Panel`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        { children: t`Admin Panel` },
      ]}
    >
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title={t`Admin console`}
            description={t`Server administration has moved to a dedicated, access-protected admin console.`}
          />
          <Button
            startIcon={<IconServer />}
            onClick={openAdminConsole}
            disabled={isOpeningAdminConsole}
            variant="outline"
          >{t`Open admin console`}</Button>
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
