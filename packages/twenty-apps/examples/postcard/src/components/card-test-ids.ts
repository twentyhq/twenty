// Shared between the front component and its e2e spec so the test ids cannot
// drift. Keep this module side-effect free so the Playwright test can import it
// without pulling in the component's SDK runtime dependencies.
export const CARD_TEST_IDS = {
  root: 'postcard-card',
  name: 'postcard-card-name',
  status: 'postcard-card-status',
  content: 'postcard-card-content',
  sdkPanel: 'postcard-sdk-panel',
  sdkCore: 'postcard-sdk-core',
  sdkMetadata: 'postcard-sdk-metadata',
  sdkRest: 'postcard-sdk-rest',
} as const;
