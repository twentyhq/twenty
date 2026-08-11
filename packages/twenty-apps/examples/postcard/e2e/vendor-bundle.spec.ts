import { expect, test, type Page, type Response } from '@playwright/test';

import { CARD_TEST_IDS } from '../src/components/card-test-ids';
import { resolveWorkspaceUrl } from './utils/resolve-workspace-url';

const RECORD_ID = process.env.E2E_POSTCARD_RECORD_ID;

const VENDOR_BUNDLE_IMPORT_SPECIFIER = 'twenty:vendor';
const REACT_LICENSE_BANNER = '@license React';

// The vendor bundle carries react and react-dom/client (~196 kB built), so
// anything below this floor means the bundle is empty or truncated. The card
// component bundle (~69 kB built, mostly the inlined front-component runtime)
// must stay well under the vendor: react living in the component again is the
// regression this test exists to catch.
const MIN_VENDOR_BUNDLE_BYTES = 50_000;
const MAX_COMPONENT_TO_VENDOR_RATIO = 1 / 2;

// With S3-style storage the endpoint answers with a JSON presigned-url
// redirect instead of streaming the bytes, so follow it before measuring.
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

test.describe('Postcard vendor bundle', () => {
  test.beforeAll(() => {
    if (!RECORD_ID) {
      throw new Error(
        'E2E_POSTCARD_RECORD_ID is required and must point to a seeded postcard record. ' +
          'Ensure the postcard app is installed and a record exists before running this test.',
      );
    }
  });

  // Same diagnostics as card-front-component.spec.ts: the component renders in
  // an iframe + Web Worker, so surface browser-side failures in the test log.
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

  test('serves the shared vendor bundle and keeps react out of the component bundle', async ({
    page,
  }) => {
    const vendorResponses: Response[] = [];
    const frontComponentResponses: Response[] = [];

    page.on('response', (response) => {
      const url = response.url();

      if (url.includes('/rest/application-vendor/')) {
        vendorResponses.push(response);
      }

      if (url.includes('/rest/front-components/')) {
        frontComponentResponses.push(response);
      }
    });

    await page.goto(`${resolveWorkspaceUrl()}/object/postCard/${RECORD_ID}`);

    // The card imports react from the vendor bundle, so a successful render
    // proves the component executed against the vendored react instance.
    const card = page.getByTestId(CARD_TEST_IDS.root);
    await expect(card).toBeVisible();
    await expect(card.getByTestId(CARD_TEST_IDS.name)).toHaveCount(1);

    expect(vendorResponses.length).toBeGreaterThan(0);

    const vendorResponse = vendorResponses[0];
    expect(vendorResponse.status()).toBe(200);
    expect(vendorResponse.url()).toMatch(
      /\/rest\/application-vendor\/[0-9a-f-]{36}\/[0-9a-f]{64}\.js$/,
    );

    const vendorBundleBody = await resolveJavaScriptBody(page, vendorResponse);
    expect(vendorBundleBody.byteLength).toBeGreaterThan(
      MIN_VENDOR_BUNDLE_BYTES,
    );

    const cardBundleBody = await findCardComponentBundleBody(
      page,
      frontComponentResponses,
    );
    expect(cardBundleBody).not.toBeNull();

    const cardBundleSource = (cardBundleBody as Buffer).toString('utf-8');
    expect(cardBundleSource).toContain(VENDOR_BUNDLE_IMPORT_SPECIFIER);
    expect(cardBundleSource).not.toContain(REACT_LICENSE_BANNER);

    expect((cardBundleBody as Buffer).byteLength).toBeLessThan(
      vendorBundleBody.byteLength * MAX_COMPONENT_TO_VENDOR_RATIO,
    );
  });
});
