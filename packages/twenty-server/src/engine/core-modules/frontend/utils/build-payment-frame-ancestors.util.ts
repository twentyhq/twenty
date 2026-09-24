import { isNonEmptyString } from '@sniptt/guards';

import { type ClientConfig } from 'src/engine/core-modules/client-config/client-config.entity';

// Workspaces embed the payment frame from the default domain, so Stripe only
// needs that one domain registered to offer Apple Pay and Google Pay.
export const buildPaymentFrameAncestors = ({
  requestBaseUrl,
  clientConfig,
}: {
  requestBaseUrl: string;
  clientConfig: Pick<ClientConfig, 'frontDomain' | 'isMultiWorkspaceEnabled'>;
}): string => {
  if (
    !clientConfig.isMultiWorkspaceEnabled ||
    !isNonEmptyString(clientConfig.frontDomain)
  ) {
    return "'self'";
  }

  const { protocol, port } = new URL(requestBaseUrl);
  const portSuffix = isNonEmptyString(port) ? `:${port}` : '';

  return `'self' ${protocol}//*.${clientConfig.frontDomain}${portSuffix}`;
};
