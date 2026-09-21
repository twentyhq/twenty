import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useMarkSessionActive } from '@/auth/hooks/useMarkSessionActive';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';
import { GetAuthTokensFromSsoExchangeTokenDocument } from '~/generated-metadata/graphql';

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
      // Keeps PageChangeEffect from consuming returnToPath while the server
      // swaps the session cookie
      setIsAppEffectRedirectEnabled(false);

      try {
        const { data } = await getAuthTokensFromSsoExchangeToken({
          variables: { ssoExchangeToken },
        });

        if (!isDefined(data?.getAuthTokensFromSSOExchangeToken)) {
          throw new Error('No getAuthTokensFromSSOExchangeToken result');
        }

        markSessionActive();
      } catch (error: unknown) {
        enqueueToast(getToastOptionsFromError({ error }));
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
