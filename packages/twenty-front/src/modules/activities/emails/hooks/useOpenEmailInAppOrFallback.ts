import { useCallback } from 'react';

import { useFirstConnectedAccount } from '@/activities/emails/hooks/useFirstConnectedAccount';
import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { isDefined } from 'twenty-shared/utils';

type UseOpenEmailInAppOrFallbackOptions = {
  skip?: boolean;
};

// Falls back to mailto: when no connected account exists, rather than
// redirecting to settings.
export const useOpenEmailInAppOrFallback = (
  options?: UseOpenEmailInAppOrFallbackOptions,
) => {
  const { connectedAccountId, loading } = useFirstConnectedAccount({
    skip: options?.skip,
  });
  const { openComposeEmailInSidePanel } = useOpenComposeEmailInSidePanel();

  const openEmail = useCallback(
    (email: string) => {
      if (isDefined(connectedAccountId)) {
        openComposeEmailInSidePanel({
          connectedAccountId,
          defaultTo: email,
        });

        return;
      }

      window.open(`mailto:${email}`, '_blank');
    },
    [connectedAccountId, openComposeEmailInSidePanel],
  );

  return { openEmail, loading };
};
