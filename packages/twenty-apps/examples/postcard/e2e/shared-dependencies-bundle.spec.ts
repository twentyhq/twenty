import { expect, test, type Page, type Response } from '@playwright/test';

import { CARD_TEST_IDS } from '../src/components/card-test-ids';
import { resolveE2eWorkspaceUrl } from './utils/resolve-e2e-workspace-url';

const RECORD_ID = process.env.E2E_POSTCARD_RECORD_ID;

const FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER = 'twenty:front-component-shared-dependencies';
const REACT_LICENSE_BANNER = '@license React';

const MIN_SHARED_DEPENDENCIES_BUNDLE_BYTES = 50_000;
const MAX_COMPONENT_TO_SHARED_DEPENDENCIES_RATIO = 1 / 2;

const resolveJavaScriptBody = async (
  page: Page,
  response: Response,
): Promise<Buffer> => {
  const contentType = response.headers()['content-type'] ?? '';

  if (contentType.includes('application/json')) {
    const { url } = (await response.json()) as { url: string };
    const redirectedResponse = await page.request.get(url);

    return Buffer.from(await redirectedResponse.body());
  }

  return response.body();
};

const findCardComponentBundleBody = async (
  page: Page,
  frontComponentResponses: Response[],
): Promise<Buffer | null> => {
  for (const response of frontComponentResponses) {
    if (response.status() !== 200) {
      continue;
    }

    const body = await resolveJavaScriptBody(page, response);

    if (body.toString('utf-8').includes(CARD_TEST_IDS.root)) {
      return body;
    }
  }

  return null;
};

test.describe('Postcard shared dependencies bundle', () => {
  test.beforeAll(() => {
    if (!RECORD_ID) {
      throw new Error(
        'E2E_POSTCARD_RECORD_ID is required and must point to a seeded postcard record. ' +
          'Ensure the postcard app is installed and a record exists before running this test.',
      );
    }
  });

  test.beforeEach(({ page }) => {
    page.on('console', (message) => {
      console.log(`[browser:${message.type()}] ${message.text()}`);
    });

    page.on('pageerror', (error) => {
      console.log(`[pageerror] ${error.message}\n${error.stack ?? ''}`);
    });

    page.on('requestfailed', (request) => {
      console.log(
        `[requestfailed] ${request.method()} ${request.url()} — ${
          request.failure()?.errorText ?? 'unknown error'
        }`,
      );
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.log(
          `[response ${response.status()}] ${response
            .request()
            .method()} ${response.url()}`,
        );
      }
    });

    page.on('worker', (worker) => {
      console.log(`[worker started] ${worker.url()}`);
    });
  });

  test('serves the shared dependencies bundle and keeps react out of the component bundle', async ({
    page,
  }) => {
    const sharedDependenciesResponses: Response[] = [];
    const frontComponentResponses: Response[] = [];

    page.on('response', (response) => {
      const url = response.url();

      if (url.includes('/rest/front-component-shared-dependencies/')) {
        sharedDependenciesResponses.push(response);
      }

      if (url.includes('/rest/front-components/')) {
        frontComponentResponses.push(response);
      }
    });

    await page.goto(`${resolveE2eWorkspaceUrl()}/object/postCard/${RECORD_ID}`);

    const card = page.getByTestId(CARD_TEST_IDS.root);
    await expect(card).toBeVisible();
    await expect(card.getByTestId(CARD_TEST_IDS.name)).toHaveCount(1);

    expect(sharedDependenciesResponses.length).toBeGreaterThan(0);

    const sharedDependenciesResponse = sharedDependenciesResponses[0];
    expect(sharedDependenciesResponse.status()).toBe(200);
    expect(sharedDependenciesResponse.url()).toMatch(
      /\/rest\/front-component-shared-dependencies\/[0-9a-f-]{36}\/[0-9a-f]{64}\.js$/,
    );

    const sharedDependenciesBundleBody = await resolveJavaScriptBody(
      page,
      sharedDependenciesResponse,
    );
    expect(sharedDependenciesBundleBody.byteLength).toBeGreaterThan(
      MIN_SHARED_DEPENDENCIES_BUNDLE_BYTES,
    );

    const cardBundleBody = await findCardComponentBundleBody(
      page,
      frontComponentResponses,
    );
    expect(cardBundleBody).not.toBeNull();

    const cardBundleSource = (cardBundleBody as Buffer).toString('utf-8');
    expect(cardBundleSource).toContain(FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER);
    expect(cardBundleSource).not.toContain(REACT_LICENSE_BANNER);

    expect((cardBundleBody as Buffer).byteLength).toBeLessThan(
      sharedDependenciesBundleBody.byteLength *
        MAX_COMPONENT_TO_SHARED_DEPENDENCIES_RATIO,
    );
  });
});
