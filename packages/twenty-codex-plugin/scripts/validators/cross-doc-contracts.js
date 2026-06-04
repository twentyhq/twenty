const path = require('node:path');

const { PLUGIN_ROOT, readText } = require('./lib');

const assertTwentyMcpFormattingContract = (fail) => {
  const skillPath = path.join(PLUGIN_ROOT, 'skills/use-twenty-mcp/SKILL.md');
  const resultFormattingPath = path.join(PLUGIN_ROOT, 'references/use-twenty-mcp/result-formatting.md');
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
      fail(`use-twenty-mcp/SKILL.md is missing formatting contract fragment: ${fragment}`);
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
      fail(`result-formatting.md is missing record-link guidance fragment: ${fragment}`);
    }
  }
};

const assertFrontComponentGuidance = (fail) => {
  const developSkillPath = path.join(PLUGIN_ROOT, 'skills/develop-app/SKILL.md');
  const layoutPath = path.join(PLUGIN_ROOT, 'references/develop-app/layout.md');
  const frontComponentsPath = path.join(PLUGIN_ROOT, 'references/develop-app/front-components.md');
  const standalonePagesPath = path.join(PLUGIN_ROOT, 'references/develop-app/standalone-pages.md');
  const appStructurePath = path.join(PLUGIN_ROOT, 'references/develop-app/app-structure.md');
  const frontComponentUiPath = path.join(PLUGIN_ROOT, 'references/design/front-component-ui.md');
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
    'yarn twenty dev:typecheck',
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

const assertCliGuidanceSplit = (fail) => {
  const developSkillPath = path.join(PLUGIN_ROOT, 'skills/develop-app/SKILL.md');
  const manageSkillPath = path.join(PLUGIN_ROOT, 'skills/manage-app/SKILL.md');
  const appStructurePath = path.join(PLUGIN_ROOT, 'references/develop-app/app-structure.md');
  const cliAndSyncPath = path.join(PLUGIN_ROOT, 'references/manage-app/cli-and-sync.md');
  const developSkill = readText(developSkillPath);
  const manageSkill = readText(manageSkillPath);
  const appStructure = readText(appStructurePath);
  const cliAndSync = readText(cliAndSyncPath);

  const requiredDevelopFragments = [
    'references/develop-app/app-structure.md',
    'yarn twenty dev:add',
    'yarn twenty dev --once',
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
    'run lint and typecheck once at the end (not after each individual edit)',
    'yarn twenty dev:typecheck',
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
    'yarn twenty remote:list',
    'Do not run `yarn twenty dev:typecheck`',
    'run outside the sandbox',
    'incompatible Node and Yarn',
  ];

  for (const fragment of forbiddenAppStructureFragments) {
    if (appStructure.includes(fragment)) {
      fail(`app-structure.md should not own CLI semantics or forbid post-edit validation: ${fragment}`);
    }
  }

  const requiredDevelopValidationFragments = [
    'run lint and typecheck once at the end (not after each individual edit)',
    'yarn twenty dev:typecheck',
    'yarn lint',
  ];

  for (const fragment of requiredDevelopValidationFragments) {
    if (!developSkill.includes(fragment)) {
      fail(`develop-app/SKILL.md is missing post-edit validation guidance: ${fragment}`);
    }
  }

  const forbiddenDevelopFragments = [
    'Do not run `yarn twenty dev:typecheck`',
    'debug the toolchain',
    'run outside the sandbox',
  ];

  for (const fragment of forbiddenDevelopFragments) {
    if (developSkill.includes(fragment)) {
      fail(`develop-app/SKILL.md should not forbid post-edit validation or warn about the sandbox: ${fragment}`);
    }
  }

  const requiredCliFragments = [
    '# CLI And Sync',
    'yarn twenty dev:typecheck',
    'yarn lint',
    'yarn twenty dev --once',
    'Always use one-shot sync to synchronize app changes with the active remote',
    'Do not use bare `yarn twenty dev` (watch mode)',
    'yarn twenty dev --once --verbose',
    'yarn twenty remote:list',
    'yarn twenty dev:build',
    'yarn twenty app:publish',
    'yarn twenty dev:function:logs',
  ];

  for (const fragment of requiredCliFragments) {
    if (!cliAndSync.includes(fragment)) {
      fail(`cli-and-sync.md is missing command guidance: ${fragment}`);
    }
  }

  const forbiddenCliFragments = [
    'run outside the sandbox',
    'incompatible Node and Yarn',
    'operations/command-execution.md',
  ];

  for (const fragment of forbiddenCliFragments) {
    if (cliAndSync.includes(fragment)) {
      fail(`cli-and-sync.md should not warn about the sandbox or reference the removed command-execution.md: ${fragment}`);
    }
  }
};

const assertTestingGuidance = (fail) => {
  const manageSkillPath = path.join(PLUGIN_ROOT, 'skills/manage-app/SKILL.md');
  const testsPath = path.join(PLUGIN_ROOT, 'references/develop-app/tests.md');
  const cliAndSyncPath = path.join(PLUGIN_ROOT, 'references/manage-app/cli-and-sync.md');
  const agentsPath = path.join(PLUGIN_ROOT, 'AGENTS.md');
  const manageSkill = readText(manageSkillPath);
  const tests = readText(testsPath);
  const cliAndSync = readText(cliAndSyncPath);
  const agents = readText(agentsPath);

  const requiredManageFragments = [
    'run tests for my Twenty app',
    'references/develop-app/tests.md',
    'yarn twenty docker:start --test',
    'TWENTY_API_URL=http://localhost:2021 yarn test',
    'Do not run integration tests against the dev instance on `http://localhost:2020`',
  ];

  for (const fragment of requiredManageFragments) {
    if (!manageSkill.includes(fragment)) {
      fail(`manage-app/SKILL.md is missing test execution guidance: ${fragment}`);
    }
  }

  const requiredSharedFragments = [
    'isolated test instance',
    'port (`2021`)',
    'TWENTY_API_URL=http://localhost:2021 yarn test',
    'Do not run integration tests against `http://localhost:2020`',
  ];

  for (const fragment of requiredSharedFragments) {
    if (!tests.includes(fragment)) {
      fail(`tests.md is missing isolated integration-test guidance: ${fragment}`);
    }
  }

  const requiredCliFragments = [
    'Integration tests install and uninstall the app on their target server',
    'yarn twenty docker:start --test',
    'port `2021`',
    '../develop-app/tests.md',
  ];

  for (const fragment of requiredCliFragments) {
    if (!cliAndSync.includes(fragment)) {
      fail(`cli-and-sync.md is missing integration-test target guidance: ${fragment}`);
    }
  }

  const requiredAgentsFragments = [
    'TWENTY_API_URL=http://localhost:2021 yarn test',
    'Integration tests must target the isolated test instance on port `2021`',
  ];

  for (const fragment of requiredAgentsFragments) {
    if (!agents.includes(fragment)) {
      fail(`AGENTS.md is missing durable test target guidance: ${fragment}`);
    }
  }
};

module.exports = {
  assertTwentyMcpFormattingContract,
  assertFrontComponentGuidance,
  assertCliGuidanceSplit,
  assertTestingGuidance,
};
