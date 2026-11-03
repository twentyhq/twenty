import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { buildAdminConsoleSignInUrl } from '@/settings/admin-panel/admin-console/utils/buildAdminConsoleSignInUrl';
import { useToast } from 'twenty-ui/components/feedback';
import { CreateAdminConsoleLoginTokenDocument } from '~/generated-metadata/graphql';

export const useOpenAdminConsole = () => {
  const location = useLocation();
  const { enqueueToast } = useToast();
  const [createAdminConsoleLoginToken, { loading }] = useMutation(
    CreateAdminConsoleLoginTokenDocument,
  );

  const enqueueOpenAdminConsoleError = (message: string) =>
    enqueueToast({
      status: 'error',
      children: t`Could not open the admin console. ${message}`,
    });

  const openAdminConsole = async () => {
    try {
      const { data, error } = await createAdminConsoleLoginToken();
      const adminConsoleLoginToken = data?.createAdminConsoleLoginToken;

      if (!isDefined(adminConsoleLoginToken)) {
        enqueueOpenAdminConsoleError(error?.message ?? '');

        return;
      }

      window.location.assign(
        buildAdminConsoleSignInUrl({
          adminConsoleUrl: adminConsoleLoginToken.adminConsoleUrl,
          loginToken: adminConsoleLoginToken.loginToken,
          returnToPath: `${location.pathname}${location.search}${location.hash}`,
        }),
      );
    } catch (error) {
      enqueueOpenAdminConsoleError(error instanceof Error ? error.message : '');
    }
  };

  return { openAdminConsole, isOpeningAdminConsole: loading };
};
