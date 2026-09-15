import { type WebClient } from '@slack/web-api';

export const runBestEffortSlackCallWithClient = async (
  description: string,
  client: WebClient,
  call: (client: WebClient) => Promise<unknown>,
): Promise<void> => {
  try {
    await call(client);
  } catch (error) {
    console.warn(
      `[slack] ${description} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
