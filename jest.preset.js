const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  // Override the new testEnvironmentOptions added in @nx/jest 22.3.3
  // which breaks Lingui's module resolution
  testEnvironmentOptions: {},
};

