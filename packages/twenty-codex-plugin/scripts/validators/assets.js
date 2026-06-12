const fs = require('node:fs');
const path = require('node:path');

const {
  MIN_LOGO_DIMENSION,
  readText,
  readPngDimensions,
  createJsonReaders,
  createInterfacePathResolver,
} = require('./lib');

const assertAssets = (fail) => {
  const { readJson } = createJsonReaders(fail);
  const resolveInterfacePath = createInterfacePathResolver(fail);
  const pluginJson = readJson('packages/twenty-codex-plugin/.codex-plugin/plugin.json');
  const interfaceMetadata = pluginJson?.interface;

  if (!interfaceMetadata) {
    return;
  }

  const logoPath = resolveInterfacePath(interfaceMetadata.logo);

  if (logoPath) {
    if (!fs.existsSync(logoPath)) {
      fail(`interface.logo file is missing: ${interfaceMetadata.logo}`);
    } else if (!logoPath.toLowerCase().endsWith('.png')) {
      fail(`interface.logo must be a PNG: ${interfaceMetadata.logo}`);
    } else {
      const dimensions = readPngDimensions(logoPath);

      if (!dimensions) {
        fail(`interface.logo is not a readable PNG: ${interfaceMetadata.logo}`);
      } else if (dimensions.width < MIN_LOGO_DIMENSION || dimensions.height < MIN_LOGO_DIMENSION) {
        fail(`interface.logo must be at least ${MIN_LOGO_DIMENSION}x${MIN_LOGO_DIMENSION} (got ${dimensions.width}x${dimensions.height})`);
      }
    }
  }

  const composerIconPath = resolveInterfacePath(interfaceMetadata.composerIcon);

  if (composerIconPath) {
    if (!fs.existsSync(composerIconPath)) {
      fail(`interface.composerIcon file is missing: ${interfaceMetadata.composerIcon}`);
    } else {
      const extension = path.extname(composerIconPath).toLowerCase();

      if (!['.png', '.svg'].includes(extension)) {
        fail(`interface.composerIcon must be PNG or SVG: ${interfaceMetadata.composerIcon}`);
      }

      if (extension === '.svg') {
        const contents = readText(composerIconPath);

        if (!/<svg[\s>]/i.test(contents)) {
          fail(`interface.composerIcon SVG must contain an <svg> root element: ${interfaceMetadata.composerIcon}`);
        }
      }
    }
  }

  if (Array.isArray(interfaceMetadata.screenshots)) {
    for (const screenshot of interfaceMetadata.screenshots) {
      const screenshotPath = resolveInterfacePath(screenshot);

      if (!screenshotPath) {
        continue;
      }

      if (!fs.existsSync(screenshotPath)) {
        fail(`interface.screenshots entry is missing: ${screenshot}`);
      } else if (!screenshotPath.toLowerCase().endsWith('.png')) {
        fail(`interface.screenshots entries must be PNG: ${screenshot}`);
      } else if (!readPngDimensions(screenshotPath)) {
        fail(`interface.screenshots entry is not a readable PNG: ${screenshot}`);
      }
    }
  }
};

module.exports = { assertAssets };
