import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3001',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      // Load environment variables
      config.env.DEFAULT_LOGIN =
        process.env.DEFAULT_LOGIN || 'tim@apple.dev';
      config.env.DEFAULT_PASSWORD =
        process.env.DEFAULT_PASSWORD || 'tim@apple.dev';
      config.env.BACKEND_BASE_URL =
        process.env.BACKEND_BASE_URL || 'http://localhost:3000';

      return config;
    },
  },
});
