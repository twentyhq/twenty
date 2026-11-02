export const checkLocalHealth = async ({
  port,
  signal,
}: {
  port: number;
  signal: AbortSignal;
}) => {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/healthz`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]),
      redirect: 'error',
    });
    await response.body?.cancel();
    return response.ok;
  } catch {
    signal.throwIfAborted();
    return false;
  }
};
