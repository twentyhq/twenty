export const getSsoExchangeTokenFromUrlHash = () =>
  new URLSearchParams(window.location.hash.substring(1)).get(
    'ssoExchangeToken',
  );
