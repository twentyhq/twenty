export async function timed<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - start;
    console.log(`[timing] ${label} ok in ${ms}ms`);
    return result;
  } catch (err) {
    const ms = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`[timing] ${label} FAILED in ${ms}ms: ${msg}`);
    throw err;
  }
}
