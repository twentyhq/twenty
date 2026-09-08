import { t } from '@lingui/core/macro';
import { formatDistance, type Locale } from 'date-fns';

import { getAiChatQuotaExhaustedKind } from '@/ai/utils/getAiChatQuotaExhaustedKind';
import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';

const getResetLabel = ({
  error,
  localeCatalog,
}: {
  error: unknown;
  localeCatalog: Locale;
}): string | null => {
  const retryAfterMs = getGraphqlErrorExtensionsFromError(error)?.retryAfterMs;

  if (typeof retryAfterMs !== 'number' || retryAfterMs <= 0) {
    return null;
  }

  return formatDistance(Date.now() + retryAfterMs, Date.now(), {
    addSuffix: true,
    locale: localeCatalog,
  });
};

// An exhausted allowance is answered by the billing banner, which carries the only action that clears it
export const getAiChatQuotaHint = ({
  error,
  localeCatalog,
}: {
  error: unknown;
  localeCatalog: Locale;
}): string | undefined => {
  if (getAiChatQuotaExhaustedKind(error) !== 'limit') {
    return undefined;
  }

  const resetLabel = getResetLabel({ error, localeCatalog });

  if (resetLabel === null) {
    return t`Ask a workspace admin to raise the limit.`;
  }

  return t`Resets ${resetLabel}. Ask a workspace admin to raise the limit.`;
};
