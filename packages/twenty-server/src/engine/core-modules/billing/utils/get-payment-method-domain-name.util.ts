/* @license Enterprise */

// Wallets only show on HTTPS pages, so local setups have nothing to register
export const getPaymentMethodDomainName = (
  workspaceUrl: string,
): string | null => {
  const { hostname, protocol } = new URL(workspaceUrl);

  return protocol === 'https:' ? hostname : null;
};
