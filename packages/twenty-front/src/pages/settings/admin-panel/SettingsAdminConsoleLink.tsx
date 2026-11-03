import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useLocation } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconServer } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { CreateAdminConsoleLoginTokenDocument } from '~/generated-metadata/graphql';

export const SettingsAdminConsoleLink = () => {
  const location = useLocation();
  const { enqueueToast } = useToast();
  const [createAdminConsoleLoginToken, { loading }] = useMutation(
    CreateAdminConsoleLoginTokenDocument,
  );

  const handleOpenAdminConsole = async () => {
    const { data, error } = await createAdminConsoleLoginToken();

    if (!data?.createAdminConsoleLoginToken) {
      enqueueToast({
        status: 'error',
        children: t`Could not open the admin console. ${error?.message ?? ''}`,
      });

      return;
    }

    const { adminConsoleUrl, loginToken } = data.createAdminConsoleLoginToken;
    const adminConsoleSignInUrl = new URL(AppPath.Verify, adminConsoleUrl);

    adminConsoleSignInUrl.searchParams.set('loginToken', loginToken);
    adminConsoleSignInUrl.searchParams.set('returnToPath', location.pathname);

    window.location.assign(adminConsoleSignInUrl.toString());
  };

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
            onClick={handleOpenAdminConsole}
            disabled={loading}
            variant="outline"
          >{t`Open admin console`}</Button>
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
