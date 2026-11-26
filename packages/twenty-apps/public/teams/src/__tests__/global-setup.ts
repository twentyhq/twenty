import { runTwenty } from './run-twenty';

const DEFERRED_OPERATIONS_PATTERN = /deferred schema operation/i;
const UNINSTALL_RETRY_DELAY_MS = 5000;
const UNINSTALL_MAX_ATTEMPTS = 15;

function validateEnvironmentOrThrow(): { apiUrl: string; apiKey: string } {
  const apiUrl = process.env.TWENTY_API_URL;
  const apiKey = process.env.TWENTY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'TWENTY_API_URL and TWENTY_API_KEY must be set.\n' +
        'Or set them in vitest env config.',
    );
  }

  return { apiUrl, apiKey };
}

async function checkServerOrThrow(apiUrl: string) {
  const response = await fetch(`${apiUrl}/healthz`).catch(() => {
    throw new Error(
      `Twenty server is not reachable at ${apiUrl}. ` +
        'Make sure the server is running before executing integration tests.',
    );
  });

  if (!response.ok) {
    throw new Error(`Server at ${apiUrl} returned ${response.status}`);
  }
}

export async function setup() {
  const { apiUrl } = validateEnvironmentOrThrow();

  await checkServerOrThrow(apiUrl);
  await teardown();

  const result = await runTwenty(['app', 'apply', '--create']);

  if (!result.ok) {
    throw new Error(
      `App apply failed: ${result.error.code} ${result.error.message}`,
    );
  }
}

async function uninstallOrThrow(attempt: number): Promise<void> {
  const result = await runTwenty(['app', 'uninstall', '--yes']);

  if (result.ok || result.error.code === 'APP_NOT_INSTALLED') {
    return;
  }

  if (
    DEFERRED_OPERATIONS_PATTERN.test(result.error.message) &&
    attempt < UNINSTALL_MAX_ATTEMPTS
  ) {
    await new Promise((resolve) =>
      setTimeout(resolve, UNINSTALL_RETRY_DELAY_MS),
    );

    return uninstallOrThrow(attempt + 1);
  }

  throw new Error(
    `App uninstall failed: ${result.error.code} ${result.error.message}`,
  );
}

export async function teardown() {
  await uninstallOrThrow(1);
}
