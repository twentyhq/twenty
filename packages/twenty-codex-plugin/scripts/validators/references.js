const fs = require('node:fs');
const path = require('node:path');

const { PLUGIN_ROOT, readText } = require('./lib');

const REQUIRED_REFERENCES = [
  'references/design/front-component-ui.md',
  'references/develop-app/app-structure.md',
  'references/develop-app/data-model.md',
  'references/develop-app/front-components.md',
  'references/develop-app/logic.md',
  'references/develop-app/layout.md',
  'references/develop-app/standalone-pages.md',
  'references/develop-app/tests.md',
  'references/develop-app/workflows.md',
  'references/manage-app/cli-and-sync.md',
  'references/publish-app/prepare-for-app-store.md',
  'references/concepts/how-apps-work.md',
  'references/use-twenty-mcp/setup.md',
  'references/use-twenty-mcp/result-formatting.md',
];

const assertReferences = (fail) => {
  for (const relativePath of REQUIRED_REFERENCES) {
    const absolutePath = path.join(PLUGIN_ROOT, relativePath);

    if (!fs.existsSync(absolutePath)) {
      fail(`required reference is missing: ${relativePath}`);
    }
  }
};

const assertHowAppsWork = (fail) => {
  const howAppsWorkPath = path.join(PLUGIN_ROOT, 'references/concepts/how-apps-work.md');

  if (!fs.existsSync(howAppsWorkPath)) {
    fail('required reference is missing: references/concepts/how-apps-work.md');
    return;
  }

  const howAppsWork = readText(howAppsWorkPath);

  const requiredFragments = [
    '# How Twenty Apps Work',
    '## What Is A Twenty App',
    'standalone npm package',
    '## SDK Packages',
    'twenty-sdk',
    'twenty-client-sdk',
    '## Twenty Instances And Remotes',
    '## Local Development Environment',
    '## App Lifecycle',
    'create-twenty-app',
    '## Front Component Rendering',
    'Remote DOM',
    '## App File Structure',
    'application-config.ts',
    '## Sharing An App',
    '## Key Concepts',
    'Universal identifiers',
  ];

  for (const fragment of requiredFragments) {
    if (!howAppsWork.includes(fragment)) {
      fail(`how-apps-work.md is missing foundational guidance: ${fragment}`);
    }
  }

  // use-twenty-mcp is intentionally excluded: it covers consuming the Twenty MCP
  // server to retrieve and present workspace records, not building apps, so the
  // app-foundations doc (how-apps-work.md) is not a relevant prerequisite for it.
  const skillsToCheck = [
    'skills/create-app/SKILL.md',
    'skills/develop-app/SKILL.md',
    'skills/manage-app/SKILL.md',
    'skills/publish-app/SKILL.md',
  ];

  for (const skillRelPath of skillsToCheck) {
    const skillPath = path.join(PLUGIN_ROOT, skillRelPath);

    if (!fs.existsSync(skillPath)) {
      fail(`required skill is missing: ${skillRelPath}`);
      continue;
    }

    const skill = readText(skillPath);

    if (!skill.includes('references/concepts/how-apps-work.md')) {
      fail(`${skillRelPath} must reference how-apps-work.md`);
    }
  }
};

module.exports = {
  REQUIRED_REFERENCES,
  assertReferences,
  assertHowAppsWork,
};
