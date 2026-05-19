#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const pluginRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(pluginRoot, '..', '..');

const failures = [];
const PUBLIC_DOCS_MCP_SERVER_NAME = 'twenty-docs';
const PUBLIC_DOCS_MCP_URL = 'https://docs.twenty.com/mcp';
const LEGACY_SKILL_NAMES = [
  'app-readme-and-visuals',
  'build-app-features',
  'create-an-app',
  'design-front-components',
  'retrieve-and-present-data',
  'setup-mcp',
];

const fail = (message) => {
  failures.push(message);
};

const readText = (filePath) => fs.readFileSync(filePath, 'utf8');

const isAllowedDocumentationHost = (hostname) => {
  const host = hostname.toLowerCase();

  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.startsWith('127.') ||
    host === '[::1]' ||
    host === 'example.com' ||
    host.endsWith('.example.com') ||
    host === 'example.twenty.com' ||
    host === 'myworkspace.twenty.com' ||
    host === 'myworkspace.customdomain.com' ||
    host === 'your-twenty-server.com' ||
    host === 'app.twenty.com' ||
    host === 'twenty.com' ||
    host === 'docs.twenty.com' ||
    host === 'www.docker.com' ||
    host === 'github.com' ||
    host === 'www.w3.org' ||
    host.endsWith('.example')
  );
};

const readJson = (relativePath) => {
  const absolutePath = path.join(repoRoot, relativePath);

  try {
    return JSON.parse(readText(absolutePath));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return undefined;
  }
};

const readOptionalJson = (relativePath) => {
  const absolutePath = path.join(repoRoot, relativePath);

  if (!fs.existsSync(absolutePath)) {
    return undefined;
  }

  return readJson(relativePath);
};

const listFiles = (directory) => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath));
    } else {
      files.push(absolutePath);
    }
  }

  return files;
};

const parseSkillFrontmatter = (skillPath) => {
  const contents = readText(skillPath);
  const match = contents.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    return undefined;
  }

  const frontmatter = {};

  for (const line of match[1].split('\n')) {
    const fieldMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);

    if (fieldMatch) {
      frontmatter[fieldMatch[1]] = fieldMatch[2].replace(/^["']|["']$/g, '');
    }
  }

  return frontmatter;
};

const parseQuotedYamlField = (contents, fieldName) => {
  const match = contents.match(new RegExp(`^\\s+${fieldName}:\\s+"([^"]+)"\\s*$`, 'm'));

  return match?.[1];
};

const assertJsonMetadata = () => {
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

    if (
      serverNames.length !== 1 ||
      serverNames[0] !== PUBLIC_DOCS_MCP_SERVER_NAME
    ) {
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

  if (fs.existsSync(path.join(repoRoot, 'plugins', 'twenty'))) {
    fail('legacy plugins/twenty path must not exist; use packages/twenty-codex-plugin directly');
  }
};

const assertNoBundledMcpConfig = () => {
  const gitignorePath = path.join(pluginRoot, '.gitignore');

  if (fs.existsSync(gitignorePath) && readText(gitignorePath).split(/\r?\n/).includes('.mcp.json')) {
    fail('packages/twenty-codex-plugin/.gitignore must not ignore the public .mcp.json');
  }

  for (const filePath of listFiles(pluginRoot)) {
    const relativePath = path.relative(pluginRoot, filePath);

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

const assertSkills = () => {
  const skillsRoot = path.join(pluginRoot, 'skills');
  const expectedCanonicalSkills = [
    'create-app',
    'develop-app',
    'manage-app',
    'publish-app',
    'use-twenty-mcp',
  ];
  const legacySkillDirectories = [
    ...LEGACY_SKILL_NAMES,
  ];
  const skillDirectories = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const skillName of expectedCanonicalSkills) {
    if (!skillDirectories.includes(skillName)) {
      fail(`canonical skill is missing: ${skillName}`);
    }
  }

  for (const skillName of legacySkillDirectories) {
    if (skillDirectories.includes(skillName)) {
      fail(`legacy skill directory must be transferred out of skills/: ${skillName}`);
    }
  }

  for (const skillName of skillDirectories) {
    const skillPath = path.join(skillsRoot, skillName, 'SKILL.md');
    const agentsPath = path.join(skillsRoot, skillName, 'agents', 'openai.yaml');

    if (!fs.existsSync(skillPath)) {
      fail(`${skillName} is missing SKILL.md`);
      continue;
    }

    const frontmatter = parseSkillFrontmatter(skillPath);

    if (!frontmatter) {
      fail(`${skillName}/SKILL.md is missing YAML frontmatter`);
    } else {
      const frontmatterKeys = Object.keys(frontmatter).sort();

      if (frontmatter.name !== skillName) {
        fail(`${skillName}/SKILL.md frontmatter name must match its directory`);
      }

      if (!frontmatter.description) {
        fail(`${skillName}/SKILL.md frontmatter description is required`);
      }

      if (frontmatterKeys.some((key) => !['description', 'name'].includes(key))) {
        fail(`${skillName}/SKILL.md frontmatter should only include name and description`);
      }
    }

    if (!fs.existsSync(agentsPath)) {
      fail(`${skillName} is missing agents/openai.yaml`);
      continue;
    }

    const agentsYaml = readText(agentsPath);
    const displayName = parseQuotedYamlField(agentsYaml, 'display_name');
    const shortDescription = parseQuotedYamlField(agentsYaml, 'short_description');
    const defaultPrompt = parseQuotedYamlField(agentsYaml, 'default_prompt');

    if (!displayName) {
      fail(`${skillName}/agents/openai.yaml is missing interface.display_name`);
    }

    if (!shortDescription) {
      fail(`${skillName}/agents/openai.yaml is missing interface.short_description`);
    } else if (shortDescription.length > 64) {
      fail(`${skillName}/agents/openai.yaml short_description must be 64 characters or fewer`);
    }

    if (!defaultPrompt) {
      fail(`${skillName}/agents/openai.yaml is missing interface.default_prompt`);
    } else if (!defaultPrompt.includes(`$${skillName}`)) {
      fail(`${skillName}/agents/openai.yaml default_prompt must mention $${skillName}`);
    }
  }
};

const assertNoLegacySkillReferences = () => {
  const filesToCheck = listFiles(pluginRoot).filter((filePath) => {
    const extension = path.extname(filePath);

    return ['.md', '.yaml', '.yml'].includes(extension);
  });

  for (const filePath of filesToCheck) {
    const relativePath = path.relative(pluginRoot, filePath);
    const contents = readText(filePath);

    for (const legacySkillName of LEGACY_SKILL_NAMES) {
      if (contents.includes(`name: ${legacySkillName}`)) {
        fail(`${relativePath} must not declare legacy skill name ${legacySkillName}`);
      }

      const mentionPattern =
        legacySkillName === 'setup-mcp'
          ? /(^|[^A-Za-z0-9_-])setup-mcp(?!\.sh)(?=$|[^A-Za-z0-9_-])/
          : new RegExp(
              `(^|[^A-Za-z0-9_-])${legacySkillName}(?=$|[^A-Za-z0-9_-])`,
            );

      if (mentionPattern.test(contents)) {
        fail(`${relativePath} must not mention legacy skill name ${legacySkillName}`);
      }
    }
  }
};

const assertReferences = () => {
  const requiredReferences = [
    'references/design/front-component-ui.md',
    'references/develop-app/app-structure.md',
    'references/develop-app/data-model.md',
    'references/develop-app/front-components.md',
    'references/develop-app/logic.md',
    'references/develop-app/layout.md',
    'references/develop-app/standalone-pages.md',
    'references/manage-app/cli-and-sync.md',
    'references/publish-app/prepare-for-app-store.md',
    'references/use-twenty-mcp/setup.md',
    'references/use-twenty-mcp/result-formatting.md',
  ];

  for (const relativePath of requiredReferences) {
    const absolutePath = path.join(pluginRoot, relativePath);

    if (!fs.existsSync(absolutePath)) {
      fail(`required reference is missing: ${relativePath}`);
    }
  }
};

const assertTwentyMcpFormattingContract = () => {
  const skillPath = path.join(
    pluginRoot,
    'skills/use-twenty-mcp/SKILL.md',
  );
  const resultFormattingPath = path.join(
    pluginRoot,
    'references/use-twenty-mcp/result-formatting.md',
  );
  const skill = readText(skillPath);
  const formatting = readText(resultFormattingPath);

  const requiredSkillFragments = [
    '# Output Contract',
    'If the tool output includes `recordReferences`',
    'MUST link each display name back to Twenty',
    '{workspaceOrigin}/object/{objectNameSingular}/{recordId}',
    'Never show unlinked record names',
  ];

  for (const fragment of requiredSkillFragments) {
    if (!skill.includes(fragment)) {
      fail(
        `use-twenty-mcp/SKILL.md is missing formatting contract fragment: ${fragment}`,
      );
    }
  }

  const requiredFormattingFragments = [
    '## Workspace Origin',
    'derive the origin from it by removing the trailing `/mcp`',
    'If `recordReferences` and workspace origin are both available',
    'the first record-name column or record heading MUST link the display name',
    'For recent companies with `recordReferences`, link the company name',
  ];

  for (const fragment of requiredFormattingFragments) {
    if (!formatting.includes(fragment)) {
      fail(
        `result-formatting.md is missing record-link guidance fragment: ${fragment}`,
      );
    }
  }
};

const assertFrontComponentGuidance = () => {
  const developSkillPath = path.join(
    pluginRoot,
    'skills/develop-app/SKILL.md',
  );
  const layoutPath = path.join(
    pluginRoot,
    'references/develop-app/layout.md',
  );
  const frontComponentsPath = path.join(
    pluginRoot,
    'references/develop-app/front-components.md',
  );
  const standalonePagesPath = path.join(
    pluginRoot,
    'references/develop-app/standalone-pages.md',
  );
  const appStructurePath = path.join(
    pluginRoot,
    'references/develop-app/app-structure.md',
  );
  const frontComponentUiPath = path.join(
    pluginRoot,
    'references/design/front-component-ui.md',
  );
  const developSkill = readText(developSkillPath);
  const layout = readText(layoutPath);
  const frontComponents = readText(frontComponentsPath);
  const standalonePages = readText(standalonePagesPath);
  const appStructure = readText(appStructurePath);
  const frontComponentUi = readText(frontComponentUiPath);

  const requiredDevelopSkillFragments = [
    'references/develop-app/front-components.md',
    'references/develop-app/standalone-pages.md',
    'Twenty UI imports',
    'Use `layout.md` for placement, `standalone-pages.md` for full-page custom UI, and `front-component-ui.md` for visual design and Twenty UI component selection',
  ];

  for (const fragment of requiredDevelopSkillFragments) {
    if (!developSkill.includes(fragment)) {
      fail(`develop-app/SKILL.md is missing front component guidance: ${fragment}`);
    }
  }

  const requiredLayoutFragments = [
    '## Front Component Widgets',
    'frontComponentUniversalIdentifier',
    'A `frontComponentId` is not the same value',
    'use `front-components.md`',
  ];

  for (const fragment of requiredLayoutFragments) {
    if (!layout.includes(fragment)) {
      fail(`layout.md is missing front component guidance: ${fragment}`);
    }
  }

  const requiredFrontComponentFragments = [
    '# Front Components',
    'defineFrontComponent',
    'Use `twenty-sdk/front-component`',
    'Use `twenty-client-sdk/core` or `twenty-client-sdk/metadata`',
    'Use `twenty-sdk/ui` for Twenty UI components',
    'Do not import from `twenty-ui` directly',
    'ThemeProvider',
    'example-sources/twenty-ui-example.front-component.tsx',
    'themeCssVariables',
    'mocks `twenty-sdk/ui` during manifest extraction',
    'A clean typecheck and sync is not runtime verification',
    'without a `FrontComponent error`',
    'hard refresh',
  ];

  for (const fragment of requiredFrontComponentFragments) {
    if (!frontComponents.includes(fragment)) {
      fail(`front-components.md is missing runtime guidance: ${fragment}`);
    }
  }

  const requiredStandalonePageFragments = [
    '# Standalone Pages',
    'custom page content should be rendered through a `FRONT_COMPONENT` widget',
    'There does not appear to be a separate public "page body component" API',
    "type: 'STANDALONE_PAGE'",
    'NavigationMenuItemType.PAGE_LAYOUT',
    'PageLayoutTabLayoutMode.CANVAS',
    'gridPosition: { row: 0, column: 0, rowSpan: 12, columnSpan: 12 }',
    '12 x 12 fill pattern',
    'Full-Page Layout Guidance',
    'black screen',
    'yarn twenty dev --once',
  ];

  for (const fragment of requiredStandalonePageFragments) {
    if (!standalonePages.includes(fragment)) {
      fail(`standalone-pages.md is missing standalone page guidance: ${fragment}`);
    }
  }

  const requiredAppStructureFragments = [
    'yarn twenty typecheck',
    'yarn lint',
    'yarn twenty dev --once',
  ];

  for (const fragment of requiredAppStructureFragments) {
    if (!appStructure.includes(fragment)) {
      fail(`app-structure.md is missing validation checklist command: ${fragment}`);
    }
  }

  const requiredUiDesignFragments = [
    '# Design Rules',
    'Do not use this reference for source files, registration, runtime imports, data access, CLI commands, or browser verification',
    '## Twenty UI Defaults',
    'Prefer Twenty UI primitives',
    'Use `Callout`',
    'Use `Button`',
    'Use `Tag`, `Status`, `Chip`, `Label`, and `Avatar`',
    'Use `themeCssVariables`',
    'Design the visible states',
  ];

  for (const fragment of requiredUiDesignFragments) {
    if (!frontComponentUi.includes(fragment)) {
      fail(`front-component-ui.md is missing design-only guidance: ${fragment}`);
    }
  }

  const forbiddenUiFragments = [
    '# Runtime Safety',
    'ReactCurrentDispatcher',
    'yarn twenty',
    'without a `FrontComponent error`',
  ];

  for (const fragment of forbiddenUiFragments) {
    if (frontComponentUi.includes(fragment)) {
      fail(`front-component-ui.md should stay design-only and not include: ${fragment}`);
    }
  }
};

const assertCliGuidanceSplit = () => {
  const developSkillPath = path.join(
    pluginRoot,
    'skills/develop-app/SKILL.md',
  );
  const manageSkillPath = path.join(
    pluginRoot,
    'skills/manage-app/SKILL.md',
  );
  const appStructurePath = path.join(
    pluginRoot,
    'references/develop-app/app-structure.md',
  );
  const cliAndSyncPath = path.join(
    pluginRoot,
    'references/manage-app/cli-and-sync.md',
  );
  const developSkill = readText(developSkillPath);
  const manageSkill = readText(manageSkillPath);
  const appStructure = readText(appStructurePath);
  const cliAndSync = readText(cliAndSyncPath);

  const requiredDevelopFragments = [
    'references/develop-app/app-structure.md',
    'After entity changes, run the validation checklist in `app-structure.md`',
    'switch to `manage-app`',
  ];

  for (const fragment of requiredDevelopFragments) {
    if (!developSkill.includes(fragment)) {
      fail(`develop-app/SKILL.md is missing CLI split guidance: ${fragment}`);
    }
  }

  const requiredManageFragments = [
    'references/manage-app/cli-and-sync.md',
    'validation command semantics',
    'sync modes',
  ];

  for (const fragment of requiredManageFragments) {
    if (!manageSkill.includes(fragment)) {
      fail(`manage-app/SKILL.md is missing CLI reference guidance: ${fragment}`);
    }
  }

  const requiredAppStructureFragments = [
    '# App Structure',
    '../manage-app/cli-and-sync.md',
    '## Entity Creation',
    '## Validation Checklist',
    'yarn twenty typecheck',
    'yarn lint',
    'yarn twenty dev --once',
  ];

  for (const fragment of requiredAppStructureFragments) {
    if (!appStructure.includes(fragment)) {
      fail(`app-structure.md is missing develop-app structure guidance: ${fragment}`);
    }
  }

  const forbiddenAppStructureFragments = [
    '# App Structure And CLI',
    'Use watch mode only',
    'Use watch mode for interactive development',
    'Use one-shot mode for agents',
    'yarn twenty dev --once --verbose',
    'yarn twenty remote list',
  ];

  for (const fragment of forbiddenAppStructureFragments) {
    if (appStructure.includes(fragment)) {
      fail(`app-structure.md should not own CLI semantics: ${fragment}`);
    }
  }

  const requiredCliFragments = [
    '# CLI And Sync',
    'yarn twenty typecheck',
    'yarn lint',
    'yarn twenty dev --once',
    'Use watch mode for interactive development',
    'Use one-shot mode for agents, scripts, CI, and quick verification',
    'yarn twenty dev --once --verbose',
    'yarn twenty remote list',
    'yarn twenty build',
    'yarn twenty deploy',
    'yarn twenty logs',
  ];

  for (const fragment of requiredCliFragments) {
    if (!cliAndSync.includes(fragment)) {
      fail(`cli-and-sync.md is missing command guidance: ${fragment}`);
    }
  }
};

const assertSetupHelper = () => {
  const setupScript = path.join(pluginRoot, 'scripts', 'setup-mcp.sh');
  const syntaxCheck = spawnSync('bash', ['-n', setupScript], { encoding: 'utf8' });

  if (syntaxCheck.status !== 0) {
    fail(`setup-mcp.sh has invalid bash syntax: ${syntaxCheck.stderr.trim()}`);
  }

  const cases = [
    ['myworkspace.localhost:3001', 'http://myworkspace.localhost:3001/mcp'],
    ['crm.example.com', 'https://crm.example.com/mcp'],
    ['https://crm.example.com/mcp', 'https://crm.example.com/mcp'],
  ];

  for (const [input, expected] of cases) {
    const result = spawnSync('bash', [setupScript, '--print-url', input], { encoding: 'utf8' });
    const actual = result.stdout.trim();

    if (result.status !== 0) {
      fail(`setup-mcp.sh --print-url ${input} failed: ${result.stderr.trim()}`);
    } else if (actual !== expected) {
      fail(`setup-mcp.sh normalized ${input} to ${actual}, expected ${expected}`);
    }
  }
};

assertJsonMetadata();
assertNoBundledMcpConfig();
assertSkills();
assertNoLegacySkillReferences();
assertReferences();
assertTwentyMcpFormattingContract();
assertFrontComponentGuidance();
assertCliGuidanceSplit();
assertSetupHelper();

if (failures.length > 0) {
  console.error('Twenty Codex plugin validation failed:');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log('Twenty Codex plugin validation passed.');
