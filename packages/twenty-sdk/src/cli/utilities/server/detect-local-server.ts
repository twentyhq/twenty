const LOCAL_PORTS = [2020, 3000];

export const checkServerHealth = async (port: number): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`http://localhost:${port}/healthz`, {
      signal: controller.signal,
    });

    const body = await response.json();

    return body.status === 'ok';
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const detectLocalServer = async (
  preferredPort?: number,
): Promise<string | null> => {
  const ports = preferredPort ? [preferredPort] : LOCAL_PORTS;

  for (const port of ports) {
    if (await checkServerHealth(port)) {
      return `http://localhost:${port}`;
    }
  }

  return null;
};
