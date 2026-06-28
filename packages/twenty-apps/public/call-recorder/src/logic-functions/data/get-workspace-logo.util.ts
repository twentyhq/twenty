import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const LOGO_DOWNLOAD_TIMEOUT_MS = 30_000;

export type WorkspaceLogo = {
  buffer: Buffer;
  contentType: string;
};

// Reads the current workspace logo. The metadata API resolves `logo` to a signed
// file URL, which we then download. Returns undefined when no logo is set or the
// fetch fails, so the bot still schedules without an image.
export const getWorkspaceLogo = async (): Promise<WorkspaceLogo | undefined> => {
  try {
    const metadataClient = new MetadataApiClient();

    const queryResult = await metadataClient.query({
      currentWorkspace: { logo: true },
    });

    const logoUrl = queryResult.currentWorkspace?.logo;

    if (!isNonEmptyString(logoUrl)) {
      return undefined;
    }

    const response = await fetch(logoUrl, {
      signal: AbortSignal.timeout(LOGO_DOWNLOAD_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(
        `[call-recorder] failed to download workspace logo: status ${response.status}`,
      );

      return undefined;
    }

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType:
        response.headers.get('content-type') ?? 'application/octet-stream',
    };
  } catch (error) {
    console.warn(
      `[call-recorder] failed to read workspace logo: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
