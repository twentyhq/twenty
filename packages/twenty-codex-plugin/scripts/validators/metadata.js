const fs = require('node:fs');
const path = require('node:path');

const {
  PLUGIN_ROOT,
  REPO_ROOT,
  PUBLIC_DOCS_MCP_SERVER_NAME,
  PUBLIC_DOCS_MCP_URL,
  VALID_CAPABILITIES,
  VALID_CATEGORIES,
  SHORT_DESCRIPTION_MAX,
  readText,
  listFiles,
  isAllowedDocumentationHost,
  createJsonReaders,
} = require('./lib');

const assertJsonMetadata = (fail) => {
  const { readJson, readOptionalJson } = createJsonReaders(fail);
  const packageJson = readJson('packages/twenty-codex-plugin/package.json');
  const pluginJson = readJson('packages/twenty-codex-plugin/.codex-plugin/plugin.json');
  const mcpJson = readJson('packages/twenty-codex-plugin/.mcp.json');
  const marketplaceJson = readOptionalJson('.agents/plugins/marketplace.json');

  if (packageJson?.version !== pluginJson?.version) {
    fail('package.json version must match .codex-plugin/plugin.json version');
  }

  if (!packageJson?.files?.includes('.mcp.json')) {
    fail('package.json files must include .mcp.json for the public docs MCP server');
  }

  if (!packageJson?.files?.includes('references')) {
    fail('package.json files must include references for shared plugin guidance');
  }

  if (pluginJson?.mcpServers !== './.mcp.json') {
    fail('.codex-plugin/plugin.json must declare mcpServers as ./.mcp.json');
  }

  const servers = mcpJson?.mcpServers;

  if (!servers || typeof servers !== 'object' || Array.isArray(servers)) {
    fail('.mcp.json must declare an mcpServers object');
  } else {
    const serverNames = Object.keys(servers);

    if (serverNames.length !== 1 || serverNames[0] !== PUBLIC_DOCS_MCP_SERVER_NAME) {
      fail(`.mcp.json must only declare ${PUBLIC_DOCS_MCP_SERVER_NAME}`);
    }

    const docsServer = servers[PUBLIC_DOCS_MCP_SERVER_NAME];

    if (!docsServer || typeof docsServer !== 'object' || Array.isArray(docsServer)) {
      fail(`${PUBLIC_DOCS_MCP_SERVER_NAME} must be an object`);
    } else {
      const docsServerKeys = Object.keys(docsServer);

      if (docsServerKeys.length !== 1 || docsServerKeys[0] !== 'url') {
        fail(`${PUBLIC_DOCS_MCP_SERVER_NAME} must only declare a url`);
      }

      if (docsServer.url !== PUBLIC_DOCS_MCP_URL) {
        fail(`${PUBLIC_DOCS_MCP_SERVER_NAME} url must be ${PUBLIC_DOCS_MCP_URL}`);
      }
    }
  }

  const marketplaceEntry = marketplaceJson?.plugins?.find((entry) => entry.name === 'twenty');

  if (marketplaceJson && !marketplaceEntry) {
    fail('.agents/plugins/marketplace.json includes plugins but not the twenty plugin entry');
  } else if (marketplaceEntry && marketplaceEntry.source?.path !== './packages/twenty-codex-plugin') {
    fail('marketplace twenty source path must be ./packages/twenty-codex-plugin');
  }

  if (fs.existsSync(path.join(REPO_ROOT, 'plugins', 'twenty'))) {
    fail('legacy plugins/twenty path must not exist; use packages/twenty-codex-plugin directly');
  }
};

const assertNoBundledMcpConfig = (fail) => {
  const gitignorePath = path.join(PLUGIN_ROOT, '.gitignore');

  if (fs.existsSync(gitignorePath) && readText(gitignorePath).split(/\r?\n/).includes('.mcp.json')) {
    fail('packages/twenty-codex-plugin/.gitignore must not ignore the public .mcp.json');
  }

  for (const filePath of listFiles(PLUGIN_ROOT)) {
    const relativePath = path.relative(PLUGIN_ROOT, filePath);

    if (relativePath.split(path.sep).includes('__tests__')) {
      continue;
    }

    if (path.basename(filePath) === '.mcp.json' && relativePath !== '.mcp.json') {
      fail(`workspace-specific MCP config must not be shipped: ${relativePath}`);
    }

    if (path.basename(filePath) === '.app.json') {
      fail(`app declarations must not be shipped unless intentionally allowed in validation: ${relativePath}`);
    }

    const contents = readText(filePath);

    const urls = contents.matchAll(/https?:\/\/[^\s"`'<>)]*/g);

    for (const [rawUrl] of urls) {
      let parsedUrl;

      if (/[${}*]/.test(rawUrl)) {
        continue;
      }

      try {
        parsedUrl = new URL(rawUrl);
      } catch {
        continue;
      }

      if (!isAllowedDocumentationHost(parsedUrl.hostname)) {
        fail(`non-placeholder URL found in ${relativePath}: ${parsedUrl.origin}`);
      }
    }

    if (/Bearer\s+(?!YOUR_API_KEY\b)[A-Za-z0-9._-]{20,}/.test(contents)) {
      fail(`possible bearer token found in ${relativePath}`);
    }

    if (/sk-[A-Za-z0-9_-]{20,}/.test(contents)) {
      fail(`possible API key found in ${relativePath}`);
    }
  }
};

const assertInterfaceFields = (fail) => {
  const { readJson } = createJsonReaders(fail);
  const pluginJson = readJson('packages/twenty-codex-plugin/.codex-plugin/plugin.json');
  const interfaceMetadata = pluginJson?.interface;

  if (!interfaceMetadata || typeof interfaceMetadata !== 'object' || Array.isArray(interfaceMetadata)) {
    fail('.codex-plugin/plugin.json must declare an interface object');
    return;
  }

  const requiredStringFields = [
    'displayName',
    'shortDescription',
    'longDescription',
    'developerName',
    'category',
    'websiteURL',
    'privacyPolicyURL',
    'termsOfServiceURL',
    'brandColor',
    'logo',
    'composerIcon',
  ];

  for (const field of requiredStringFields) {
    const value = interfaceMetadata[field];

    if (typeof value !== 'string' || value.trim().length === 0) {
      fail(`.codex-plugin/plugin.json interface.${field} must be a non-empty string`);
    }
  }

  if (typeof interfaceMetadata.shortDescription === 'string' && interfaceMetadata.shortDescription.length > SHORT_DESCRIPTION_MAX) {
    fail(`.codex-plugin/plugin.json interface.shortDescription must be ${SHORT_DESCRIPTION_MAX} characters or fewer`);
  }

  if (typeof interfaceMetadata.brandColor === 'string' && !/^#[0-9a-fA-F]{6}$/.test(interfaceMetadata.brandColor)) {
    fail('.codex-plugin/plugin.json interface.brandColor must match #RRGGBB hex format');
  }

  if (typeof interfaceMetadata.category === 'string' && !VALID_CATEGORIES.has(interfaceMetadata.category)) {
    fail(`.codex-plugin/plugin.json interface.category must be one of: ${[...VALID_CATEGORIES].join(', ')}`);
  }

  if (!Array.isArray(interfaceMetadata.capabilities) || interfaceMetadata.capabilities.length === 0) {
    fail('.codex-plugin/plugin.json interface.capabilities must be a non-empty array');
  } else {
    for (const capability of interfaceMetadata.capabilities) {
      if (!VALID_CAPABILITIES.has(capability)) {
        fail(`.codex-plugin/plugin.json interface.capabilities contains invalid value: ${capability}`);
      }
    }
  }

  if (!Array.isArray(interfaceMetadata.defaultPrompt) || interfaceMetadata.defaultPrompt.length === 0) {
    fail('.codex-plugin/plugin.json interface.defaultPrompt must be a non-empty array of strings');
  } else {
    for (const prompt of interfaceMetadata.defaultPrompt) {
      if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        fail('.codex-plugin/plugin.json interface.defaultPrompt entries must be non-empty strings');
      }
    }
  }

  if (!Array.isArray(interfaceMetadata.screenshots)) {
    fail('.codex-plugin/plugin.json interface.screenshots must be an array (use [] if no screenshots yet)');
  }
};

const assertMarketplaceTemplate = (fail) => {
  const { readJson, readOptionalJson } = createJsonReaders(fail);
  const templatePath = 'packages/twenty-codex-plugin/templates/marketplace.example.json';
  const template = readOptionalJson(templatePath);
  const pluginJson = readJson('packages/twenty-codex-plugin/.codex-plugin/plugin.json');

  if (!template) {
    fail(`marketplace template is missing at ${templatePath}`);
    return;
  }

  const entries = template.plugins;

  if (!Array.isArray(entries) || entries.length === 0) {
    fail(`${templatePath} must declare a non-empty plugins array`);
    return;
  }

  const twentyEntry = entries.find((entry) => entry?.name === 'twenty');

  if (!twentyEntry) {
    fail(`${templatePath} must include a plugin entry named "twenty"`);
    return;
  }

  if (twentyEntry.version !== pluginJson?.version) {
    fail(`${templatePath} twenty.version must match plugin.json version`);
  }

  if (twentyEntry.source?.path !== './packages/twenty-codex-plugin') {
    fail(`${templatePath} twenty.source.path must be ./packages/twenty-codex-plugin`);
  }

  if (!twentyEntry.policy?.installation) {
    fail(`${templatePath} twenty.policy.installation is required`);
  }

  if (!twentyEntry.policy?.authentication) {
    fail(`${templatePath} twenty.policy.authentication is required`);
  }

  if (twentyEntry.category !== pluginJson?.interface?.category) {
    fail(`${templatePath} twenty.category must match plugin.json interface.category`);
  }
};

module.exports = {
  assertJsonMetadata,
  assertNoBundledMcpConfig,
  assertInterfaceFields,
  assertMarketplaceTemplate,
};
