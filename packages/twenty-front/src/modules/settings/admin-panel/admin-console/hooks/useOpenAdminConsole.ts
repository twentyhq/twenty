import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useToast } from 'twenty-ui/components/feedback';
import { CreateAdminConsoleLoginTokenDocument } from '~/generated-metadata/graphql';

export const useOpenAdminConsole = () => {
  const location = useLocation();
  const { enqueueToast } = useToast();
  const [createAdminConsoleLoginToken, { loading }] = useMutation(
    CreateAdminConsoleLoginTokenDocument,
  );

  const openAdminConsole = async () => {
    const { data, error } = await createAdminConsoleLoginToken();
    const adminConsoleLoginToken = data?.createAdminConsoleLoginToken;

    if (!isDefined(adminConsoleLoginToken)) {
      enqueueToast({
        status: 'error',
        children: t`Could not open the admin console. ${error?.message ?? ''}`,
      });

      return;
    }

    const adminConsoleSignInUrl = new URL(
      AppPath.Verify,
      adminConsoleLoginToken.adminConsoleUrl,
    );

    adminConsoleSignInUrl.searchParams.set(
      'loginToken',
      adminConsoleLoginToken.loginToken,
    );
    adminConsoleSignInUrl.searchParams.set(
      'returnToPath',
      `${location.pathname}${location.search}${location.hash}`,
    );

    window.location.assign(adminConsoleSignInUrl.toString());
  };

  return { openAdminConsole, isOpeningAdminConsole: loading };
};
