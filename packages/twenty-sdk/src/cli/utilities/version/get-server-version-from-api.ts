import { ConfigService } from '@/cli/utilities/config/config-service';
import { parseSemver } from '@/cli/utilities/version/parse-semver';

const SERVER_CARD_PATH = '/.well-known/mcp/server-card.json';
const FETCH_TIMEOUT_MS = 3000;

export const getServerVersionFromApi = async (
  apiUrl?: string,
): Promise<string | null> => {
  const baseUrl = apiUrl ?? (await new ConfigService().getConfig()).apiUrl;

  if (!baseUrl) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}${SERVER_CARD_PATH}`,
      { signal: controller.signal },
    );

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as { version?: unknown };

    if (typeof body.version !== 'string') {
      return null;
    }

    const version = body.version.trim().replace(/^v/, '');

    if (version === '0.0.0' || parseSemver(version) === null) {
      return null;
    }

    return version;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
