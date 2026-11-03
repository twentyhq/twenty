import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { fetchWithTimeout } from 'src/logic-functions/utils/fetch-with-timeout.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type WorkspaceBranding = {
  logo: Buffer | undefined;
  displayName: string | undefined;
};

const downloadLogo = async (logoUrl: string): Promise<Buffer | undefined> => {
  try {
    const response = await fetchWithTimeout(logoUrl);

    if (!response.ok) {
      console.warn(
        `[call-recorder] failed to download workspace logo: status ${response.status}`,
      );

      return undefined;
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.warn(
      `[call-recorder] failed to download workspace logo: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};

export const getWorkspaceBranding = async (): Promise<WorkspaceBranding> => {
  try {
    const metadataClient = new MetadataApiClient();

    const queryResult = await metadataClient.query({
      currentWorkspace: { logo: true, displayName: true },
    });

    const logoUrl = queryResult.currentWorkspace?.logo;
    const displayName = queryResult.currentWorkspace?.displayName
      ?.replace(/\s+/gu, ' ')
      .trim();

    return {
      logo: isNonEmptyString(logoUrl) ? await downloadLogo(logoUrl) : undefined,
      displayName: isNonEmptyString(displayName) ? displayName : undefined,
    };
  } catch (error) {
    console.warn(
      `[call-recorder] failed to read workspace branding: ${error instanceof Error ? error.message : String(error)}`,
    );

    return { logo: undefined, displayName: undefined };
  }
};
