// An authenticating reverse proxy in front of the app (Cloudflare Access) answers
// an expired session with a redirect to its own login origin. fetch() follows it,
// that origin sends no CORS headers, and the request fails as an opaque
// "Failed to fetch" carrying no status to inspect, so the app cannot tell an
// expired proxy session from the network being down. Re-probing with
// redirect: 'manual' resolves to an opaqueredirect response rather than throwing,
// which tells the two apart.
export const isAuthProxyRedirect = async (
  probeUrl: string,
): Promise<boolean> => {
  try {
    const response = await fetch(probeUrl, {
      method: 'GET',
      redirect: 'manual',
      credentials: 'include',
      cache: 'no-store',
    });

    // oxlint-disable-next-line no-console
    console.log(
      `Auth proxy probe on ${probeUrl}: type=${response.type} status=${response.status}`,
    );

    return response.type === 'opaqueredirect';
  } catch (error) {
    // oxlint-disable-next-line no-console
    console.log(`Auth proxy probe on ${probeUrl} threw`, error);

    return false;
  }
};
