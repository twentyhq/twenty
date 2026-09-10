import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useMarkSessionActive } from '@/auth/hooks/useMarkSessionActive';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { GetAuthTokensFromSsoExchangeTokenDocument } from '~/generated-metadata/graphql';

export const useRedeemSsoExchangeToken = () => {
  const { addErrorToast } = useErrorToast();
  const { add: addToast } = useToast();
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
        if (CombinedGraphQLErrors.is(error)) {
          addErrorToast(error);
        } else {
          addToast({
            variant: 'error',
            children:
              (error instanceof Error ? error.message : undefined) ??
              t`An error occurred.`,
          });
        }
      } finally {
        setIsAppEffectRedirectEnabled(true);
      }
    },
    [
      getAuthTokensFromSsoExchangeToken,
      markSessionActive,
      setIsAppEffectRedirectEnabled,
      addErrorToast,
      addToast,
    ],
  );

  return { redeemSsoExchangeToken };
};
