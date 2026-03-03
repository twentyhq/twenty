import * as fs from 'fs';
import * as path from 'path';
import { appBuild, appUninstall } from 'twenty-sdk/cli';
import { MetadataApiClient } from 'twenty-sdk/generated';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const APP_PATH = path.resolve(__dirname, '../..');
const TWENTY_API_URL = process.env.TWENTY_API_URL ?? 'http://localhost:3000';
const TWENTY_CONFIG_PATH = process.env.TWENTY_CONFIG_PATH;

const POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER =
  '54b589ca-eeed-4950-a176-358418b85c05';

const readApiKeyFromConfig = (): string | undefined => {
  if (!TWENTY_CONFIG_PATH || !fs.existsSync(TWENTY_CONFIG_PATH)) {
    return undefined;
  }

  const config = JSON.parse(fs.readFileSync(TWENTY_CONFIG_PATH, 'utf-8'));

  return config.apiKey;
};

const assertServerIsReachable = async () => {
  try {
    const response = await fetch(`${TWENTY_API_URL}/healthz`);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch {
    throw new Error(
      `Twenty server is not reachable at ${TWENTY_API_URL}. ` +
        'Make sure the server is running before executing integration tests.',
    );
  }
};

describe('Hello World app installation', () => {
  let appInstalled = false;

  beforeAll(async () => {
    await assertServerIsReachable();

    const buildResult = await appBuild({
      appPath: APP_PATH,
      onProgress: (message: string) => console.log(`[build] ${message}`),
    });

    if (!buildResult.success) {
      throw new Error(
        `App build failed: ${buildResult.error?.message ?? 'Unknown error'}`,
      );
    }

    appInstalled = true;
  });

  afterAll(async () => {
    if (!appInstalled) {
      return;
    }

    const uninstallResult = await appUninstall({ appPath: APP_PATH });

    if (!uninstallResult.success) {
      console.warn(
        `App uninstall failed: ${uninstallResult.error?.message ?? 'Unknown error'}`,
      );
    }
  });

  it('should have the postCard object in object metadata after installation', async () => {
    const apiKey = readApiKeyFromConfig();
    const metadataClient = new MetadataApiClient({
      url: `${TWENTY_API_URL}/metadata`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const result = await metadataClient.query({
      objects: {
        __args: {
          paging: { first: 200 },
          filter: {},
        },
        edges: {
          node: {
            id: true,
            universalIdentifier: true,
            nameSingular: true,
            namePlural: true,
            isActive: true,
            isCustom: true,
          },
        },
      },
    });

    const postCardObject = result.objects.edges.find(
      (edge) =>
        edge.node.universalIdentifier ===
        POST_CARD_OBJECT_UNIVERSAL_IDENTIFIER,
    );

    expect(postCardObject).toMatchObject({
      node: {
        nameSingular: 'postCard',
        namePlural: 'postCards',
        isActive: true,
      },
    });
  });
});
