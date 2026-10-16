import { isAppEffectRedirectEnabledState } from '@/auth/states/isAppEffectRedirectEnabledState';
import { useMarkSessionActive } from '@/auth/hooks/useMarkSessionActive';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { useToast } from 'twenty-ui/components/feedback';
import { GetAuthTokensFromSsoExchangeTokenDocument } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useRedeemSsoExchangeToken = () => {
  const { enqueueToast } = useToast();
  const markSessionActive = useMarkSessionActive();
  const setIsAppEffectRedirectEnabled = useSetAtomState(
    isAppEffectRedirectEnabledState,
  );
  const [getAuthTokensFromSsoExchangeToken] = useMutation(
    GetAuthTokensFromSsoExchangeTokenDocument,
  );

  const redeemSsoExchangeToken = useCallback(
    async (ssoExchangeToken: string) => {
      // Keeps PageChangeEffect from consuming returnToPath while the server swaps the session cookie
      setIsAppEffectRedirectEnabled(false);

      try {
        const { data } = await getAuthTokensFromSsoExchangeToken({
          variables: { ssoExchangeToken },
        });

        if (!isDefined(data?.getAuthTokensFromSSOExchangeToken)) {
          throw new Error(
            doNotTranslate('No getAuthTokensFromSSOExchangeToken result'),
          );
        }

        markSessionActive();
      } catch (error: unknown) {
        logError(error);
        enqueueToast({ status: 'error', children: t`Authentication failed` });
      } finally {
        setIsAppEffectRedirectEnabled(true);
      }
    },
    [
      getAuthTokensFromSsoExchangeToken,
      markSessionActive,
      setIsAppEffectRedirectEnabled,
      enqueueToast,
    ],
  );

  return { redeemSsoExchangeToken };
};
