import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useMarkSessionActive } from '@/auth/hooks/useMarkSessionActive';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { GetAuthTokensFromSsoExchangeTokenDocument } from '~/generated-metadata/graphql';

export const useRedeemSSOExchangeToken = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const markSessionActive = useMarkSessionActive();
  const setIsAppEffectRedirectEnabled = useSetAtomState(
    isAppEffectRedirectEnabledState,
  );
  const [getAuthTokensFromSSOExchangeToken] = useMutation(
    GetAuthTokensFromSsoExchangeTokenDocument,
  );

  const redeemSSOExchangeToken = useCallback(
    async (ssoExchangeToken: string) => {
      // Keeps PageChangeEffect from consuming returnToPath while the server
      // swaps the session cookie
      setIsAppEffectRedirectEnabled(false);

      try {
        const { data } = await getAuthTokensFromSSOExchangeToken({
          variables: { ssoExchangeToken },
        });

        if (!isDefined(data?.getAuthTokensFromSSOExchangeToken)) {
          throw new Error('No getAuthTokensFromSSOExchangeToken result');
        }

        markSessionActive();
      } catch (error: unknown) {
        enqueueErrorSnackBar(
          CombinedGraphQLErrors.is(error)
            ? { apolloError: error }
            : { message: error instanceof Error ? error.message : undefined },
        );
      } finally {
        setIsAppEffectRedirectEnabled(true);
      }
    },
    [
      getAuthTokensFromSSOExchangeToken,
      markSessionActive,
      setIsAppEffectRedirectEnabled,
      enqueueErrorSnackBar,
    ],
  );

  return { redeemSSOExchangeToken };
};
