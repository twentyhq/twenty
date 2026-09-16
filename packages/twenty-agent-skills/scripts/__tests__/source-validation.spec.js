import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as metadata from '../validators/metadata.js';
import * as assets from '../validators/assets.js';
import * as skills from '../validators/skills.js';
import * as references from '../validators/references.js';
import * as crossDocContracts from '../validators/cross-doc-contracts.js';
import * as setupHelper from '../validators/setup-helper.js';

const PLUGIN_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const PLUGIN_JSON_PATH = path.join(PLUGIN_ROOT, '.codex-plugin', 'plugin.json');
const PACKAGE_JSON_PATH = path.join(PLUGIN_ROOT, 'package.json');
const MCP_JSON_PATH = path.join(PLUGIN_ROOT, '.mcp.json');
const MARKETPLACE_TEMPLATE_PATH = path.join(PLUGIN_ROOT, 'templates', 'marketplace.example.json');

const collectFailures = (assertion) => {
  const failures = [];
  assertion((message) => failures.push(message));
  return failures;
};

const withFileMutation = (filePath, mutator, body) => {
  const original = fs.readFileSync(filePath, 'utf8');

  try {
    fs.writeFileSync(filePath, mutator(original));
    body();
  } finally {
    fs.writeFileSync(filePath, original);
  }
};

const withJsonMutation = (filePath, mutator, body) =>
  withFileMutation(
    filePath,
    (original) => {
      const data = JSON.parse(original);
      mutator(data);
      return `${JSON.stringify(data, null, 2)}\n`;
    },
    body,
  );

const withExtraFile = (filePath, contents, body) => {
  try {
    fs.writeFileSync(filePath, contents);
    body();
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// ---------------------------------------------------------------------------
// Smoke tests — every assertion should pass on the current plugin state.
// ---------------------------------------------------------------------------

test('assertJsonMetadata passes on current state', () => {
  assert.deepStrictEqual(collectFailures(metadata.assertJsonMetadata), []);
});

test('assertNoBundledMcpConfig passes on current state', () => {
  assert.deepStrictEqual(collectFailures(metadata.assertNoBundledMcpConfig), []);
});

test('assertInterfaceFields passes on current state', () => {
  assert.deepStrictEqual(collectFailures(metadata.assertInterfaceFields), []);
});

test('assertMarketplaceTemplate passes on current state', () => {
  assert.deepStrictEqual(collectFailures(metadata.assertMarketplaceTemplate), []);
});

test('assertAssets passes on current state', () => {
  assert.deepStrictEqual(collectFailures(assets.assertAssets), []);
});

test('assertSkills passes on current state', () => {
  assert.deepStrictEqual(collectFailures(skills.assertSkills), []);
});

test('assertSkillTriggerPhrases passes on current state', () => {
  assert.deepStrictEqual(collectFailures(skills.assertSkillTriggerPhrases), []);
});

test('assertNoLegacySkillReferences passes on current state', () => {
  assert.deepStrictEqual(collectFailures(skills.assertNoLegacySkillReferences), []);
});

test('assertReferences passes on current state', () => {
  assert.deepStrictEqual(collectFailures(references.assertReferences), []);
});

test('assertHowAppsWork passes on current state', () => {
  assert.deepStrictEqual(collectFailures(references.assertHowAppsWork), []);
});

test('assertTwentyMcpFormattingContract passes on current state', () => {
  assert.deepStrictEqual(collectFailures(crossDocContracts.assertTwentyMcpFormattingContract), []);
});

test('assertFrontComponentGuidance passes on current state', () => {
  assert.deepStrictEqual(collectFailures(crossDocContracts.assertFrontComponentGuidance), []);
});

test('assertFrontComponentGuidance catches independent UI version guidance', () => {
  const frontComponentsPath = path.join(
    PLUGIN_ROOT,
    'references/develop-app/front-components.md',
  );

  withFileMutation(
    frontComponentsPath,
    (contents) => contents.replace(
      'at the same version as `twenty-sdk` and `twenty-client-sdk`',
      'at an independent version',
    ),
    () => {
      const failures = collectFailures(crossDocContracts.assertFrontComponentGuidance);
      assert.ok(failures.some((failure) => failure.includes('same version as')));
    },
  );
});

test('assertCliGuidanceSplit passes on current state', () => {
  assert.deepStrictEqual(collectFailures(crossDocContracts.assertCliGuidanceSplit), []);
});

test('assertCliGuidanceSplit catches deprecated dev --once guidance', () => {
  const cliAndSyncPath = path.join(
    PLUGIN_ROOT,
    'references',
    'manage-app',
    'cli-and-sync.md',
  );

  withFileMutation(
    cliAndSyncPath,
    (contents) => contents.replace('yarn twenty apply', 'yarn twenty dev --once'),
    () => {
      const failures = collectFailures(crossDocContracts.assertCliGuidanceSplit);

      assert.ok(
        failures.some((failure) => failure.includes('yarn twenty dev --once')),
      );
    },
  );
});

test('assertCliGuidanceSplit catches deprecated guidance outside the CLI reference', () => {
  const manageSkillPath = path.join(
    PLUGIN_ROOT,
    'skills',
    'manage-app',
    'SKILL.md',
  );

  withFileMutation(
    manageSkillPath,
    (contents) => `${contents}\nRun yarn twenty dev --once after editing.\n`,
    () => {
      const failures = collectFailures(crossDocContracts.assertCliGuidanceSplit);

      assert.ok(
        failures.some(
          (failure) =>
            failure.includes('skills/manage-app/SKILL.md') &&
            failure.includes('yarn twenty dev --once'),
        ),
      );
    },
  );
});

test('assertCliGuidanceSplit catches stale one-shot sync terminology', () => {
  const standalonePagesPath = path.join(
    PLUGIN_ROOT,
    'references',
    'develop-app',
    'standalone-pages.md',
  );

  withFileMutation(
    standalonePagesPath,
    (contents) => `${contents}\nUse one-shot sync for verification.\n`,
    () => {
      const failures = collectFailures(crossDocContracts.assertCliGuidanceSplit);

      assert.ok(
        failures.some(
          (failure) =>
            failure.includes('references/develop-app/standalone-pages.md') &&
            failure.includes('one-shot sync'),
        ),
      );
    },
  );
});

test('assertTestingGuidance passes on current state', () => {
  assert.deepStrictEqual(collectFailures(crossDocContracts.assertTestingGuidance), []);
});

test('assertSetupHelper passes on current state', () => {
  assert.deepStrictEqual(collectFailures(setupHelper.assertSetupHelper), []);
});

// ---------------------------------------------------------------------------
// Negative cases — each assertion catches its targeted failure.
// ---------------------------------------------------------------------------

test('assertJsonMetadata catches version mismatch between package.json and plugin.json', () => {
  withJsonMutation(PACKAGE_JSON_PATH, (pkg) => { pkg.version = '99.99.99'; }, () => {
    const failures = collectFailures(metadata.assertJsonMetadata);
    assert.ok(
      failures.some((f) => f.includes('version must match')),
      `expected version-mismatch failure, got: ${failures.join('; ')}`,
    );
  });
});

test('assertJsonMetadata catches missing .mcp.json from package.json files', () => {
  withJsonMutation(PACKAGE_JSON_PATH, (pkg) => {
    pkg.files = pkg.files.filter((f) => f !== '.mcp.json');
  }, () => {
    const failures = collectFailures(metadata.assertJsonMetadata);
    assert.ok(failures.some((f) => f.includes('.mcp.json')));
  });
});

test('assertJsonMetadata catches non-canonical MCP server', () => {
  withJsonMutation(MCP_JSON_PATH, (mcp) => {
    mcp.mcpServers['rogue-server'] = { url: 'https://example.com/mcp' };
  }, () => {
    const failures = collectFailures(metadata.assertJsonMetadata);
    assert.ok(failures.some((f) => f.includes('twenty-docs')));
  });
});

test('assertNoBundledMcpConfig catches a bundled .app.json', () => {
  const stub = path.join(PLUGIN_ROOT, '.app.json');
  withExtraFile(stub, '{}', () => {
    const failures = collectFailures(metadata.assertNoBundledMcpConfig);
    assert.ok(failures.some((f) => f.includes('app declarations must not be shipped')));
  });
});

test('assertNoBundledMcpConfig catches a non-placeholder URL', () => {
  const stub = path.join(PLUGIN_ROOT, 'scratch-url-check.md');
  withExtraFile(stub, 'see https://internal.private-domain.test/secret for details', () => {
    const failures = collectFailures(metadata.assertNoBundledMcpConfig);
    assert.ok(failures.some((f) => f.includes('non-placeholder URL')));
  });
});

test('assertNoBundledMcpConfig catches a bearer token', () => {
  const stub = path.join(PLUGIN_ROOT, 'scratch-bearer.md');
  withExtraFile(stub, 'Authorization: Bearer abc123def456ghi789jkl012mno', () => {
    const failures = collectFailures(metadata.assertNoBundledMcpConfig);
    assert.ok(failures.some((f) => f.includes('bearer token')));
  });
});

test('source scans ignore generated distribution files', () => {
  const distributionRoot = path.join(PLUGIN_ROOT, 'dist');
  fs.mkdirSync(distributionRoot, { recursive: true });
  const fixtureRoot = fs.mkdtempSync(path.join(distributionRoot, 'source-validation-'));

  try {
    fs.writeFileSync(path.join(fixtureRoot, '.mcp.json'), '{}');
    fs.writeFileSync(path.join(fixtureRoot, 'SKILL.md'), 'name: create-an-app\n');

    assert.deepStrictEqual(collectFailures(metadata.assertNoBundledMcpConfig), []);
    assert.deepStrictEqual(collectFailures(skills.assertNoLegacySkillReferences), []);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test('assertInterfaceFields catches invalid brandColor', () => {
  withJsonMutation(PLUGIN_JSON_PATH, (j) => { j.interface.brandColor = 'red'; }, () => {
    const failures = collectFailures(metadata.assertInterfaceFields);
    assert.ok(failures.some((f) => f.includes('brandColor must match')));
  });
});

test('assertInterfaceFields catches too-long shortDescription', () => {
  withJsonMutation(PLUGIN_JSON_PATH, (j) => { j.interface.shortDescription = 'x'.repeat(100); }, () => {
    const failures = collectFailures(metadata.assertInterfaceFields);
    assert.ok(failures.some((f) => f.includes('shortDescription must be 64')));
  });
});

test('assertInterfaceFields catches unknown category', () => {
  withJsonMutation(PLUGIN_JSON_PATH, (j) => { j.interface.category = 'Photography'; }, () => {
    const failures = collectFailures(metadata.assertInterfaceFields);
    assert.ok(failures.some((f) => f.includes('category must be one of')));
  });
});

test('assertInterfaceFields catches invalid capability', () => {
  withJsonMutation(PLUGIN_JSON_PATH, (j) => { j.interface.capabilities = ['Magic']; }, () => {
    const failures = collectFailures(metadata.assertInterfaceFields);
    assert.ok(failures.some((f) => f.includes('capabilities contains invalid value')));
  });
});

test('assertInterfaceFields catches empty defaultPrompt', () => {
  withJsonMutation(PLUGIN_JSON_PATH, (j) => { j.interface.defaultPrompt = []; }, () => {
    const failures = collectFailures(metadata.assertInterfaceFields);
    assert.ok(failures.some((f) => f.includes('defaultPrompt')));
  });
});

test('assertAssets catches a missing screenshot reference', () => {
  withJsonMutation(PLUGIN_JSON_PATH, (j) => {
    j.interface.screenshots = ['./assets/screenshots/nonexistent.png'];
  }, () => {
    const failures = collectFailures(assets.assertAssets);
    assert.ok(failures.some((f) => f.includes('screenshots entry is missing')));
  });
});

test('assertAssets catches a non-PNG logo', () => {
  withJsonMutation(PLUGIN_JSON_PATH, (j) => { j.interface.logo = './assets/twenty-logo.svg'; }, () => {
    const failures = collectFailures(assets.assertAssets);
    assert.ok(failures.some((f) => f.includes('logo must be a PNG')));
  });
});

test('assertMarketplaceTemplate requires marketplace identity', () => {
  withJsonMutation(MARKETPLACE_TEMPLATE_PATH, (template) => {
    delete template.name;
    delete template.interface;
  }, () => {
    const failures = collectFailures(metadata.assertMarketplaceTemplate);
    assert.ok(failures.some((failure) => failure.includes('name must be a non-empty string')));
    assert.ok(failures.some((failure) => failure.includes('interface.displayName must be a non-empty string')));
  });
});

test('assertMarketplaceTemplate catches the legacy source descriptor', () => {
  withJsonMutation(MARKETPLACE_TEMPLATE_PATH, (template) => {
    template.plugins[0].source = {
      type: 'local',
      path: './packages/twenty-agent-skills/dist',
    };
  }, () => {
    const failures = collectFailures(metadata.assertMarketplaceTemplate);
    assert.ok(failures.some((failure) => failure.includes('source.source must be local')));
  });
});

for (const [field, value] of [['installation', 'manual'], ['authentication', 'user-local']]) {
  test(`assertMarketplaceTemplate catches legacy ${field} policy`, () => {
    withJsonMutation(MARKETPLACE_TEMPLATE_PATH, (template) => {
      template.plugins[0].policy[field] = value;
    }, () => {
      const failures = collectFailures(metadata.assertMarketplaceTemplate);
      assert.ok(failures.some((failure) => failure.includes(`policy.${field} must be`)));
    });
  });
}

test('assertMarketplaceTemplate requires the installable distribution path', () => {
  withJsonMutation(MARKETPLACE_TEMPLATE_PATH, (template) => {
    template.plugins[0].source.path = './packages/twenty-agent-skills';
  }, () => {
    const failures = collectFailures(metadata.assertMarketplaceTemplate);
    assert.ok(failures.some((failure) => failure.includes('source.path must be ./packages/twenty-agent-skills/dist')));
  });
});

test('assertSkillTriggerPhrases catches a SKILL.md missing the When To Use section', () => {
  const skillPath = path.join(PLUGIN_ROOT, 'skills', 'create-app', 'SKILL.md');
  withFileMutation(skillPath, (original) => original.replace(/^#+\s+When To Use[\s\S]*?(?=\n#\s)/m, ''), () => {
    const failures = collectFailures(skills.assertSkillTriggerPhrases);
    assert.ok(failures.some((f) => f.includes('create-app') && f.includes('When To Use')));
  });
});

test('assertTestingGuidance catches missing manage-app test target instructions', () => {
  const skillPath = path.join(PLUGIN_ROOT, 'skills', 'manage-app', 'SKILL.md');
  withFileMutation(skillPath, (original) => original.replace('TWENTY_API_URL=http://localhost:2021 yarn test', 'yarn test'), () => {
    const failures = collectFailures(crossDocContracts.assertTestingGuidance);
    assert.ok(
      failures.some((f) => f.includes('manage-app/SKILL.md') && f.includes('TWENTY_API_URL')),
      `expected manage-app test target failure, got: ${failures.join('; ')}`,
    );
  });
});

test('assertOperatingRulesSingleSource passes on current state', () => {
  assert.deepStrictEqual(collectFailures(crossDocContracts.assertOperatingRulesSingleSource), []);
});

test('assertOperatingRulesSingleSource catches AGENTS.md restating a rule', () => {
  const agentsPath = path.join(PLUGIN_ROOT, 'AGENTS.md');
  withFileMutation(agentsPath, (original) => `${original}\n1. **Confirm destructive operations.** Restated.\n`, () => {
    const failures = collectFailures(crossDocContracts.assertOperatingRulesSingleSource);
    assert.ok(
      failures.some((f) => f.includes('AGENTS.md') && f.includes('restates an operating rule')),
      `expected a restated-rule failure, got: ${failures.join('; ')}`,
    );
  });
});

test('assertOperatingRulesSingleSource catches AGENTS.md losing the pointer', () => {
  const agentsPath = path.join(PLUGIN_ROOT, 'AGENTS.md');
  withFileMutation(agentsPath, (original) => original.replaceAll('references/concepts/operating-rules.md', 'nowhere.md'), () => {
    const failures = collectFailures(crossDocContracts.assertOperatingRulesSingleSource);
    assert.ok(
      failures.some((f) => f.includes('AGENTS.md must point at')),
      `expected a missing-pointer failure, got: ${failures.join('; ')}`,
    );
  });
});

test('assertHowAppsWork catches a skill that does not reference operating-rules.md', () => {
  const skillPath = path.join(PLUGIN_ROOT, 'skills', 'develop-app', 'SKILL.md');
  withFileMutation(skillPath, (original) => original.replace('../../references/concepts/operating-rules.md', 'nowhere.md'), () => {
    const failures = collectFailures(references.assertHowAppsWork);
    assert.ok(
      failures.some((f) => f.includes('develop-app/SKILL.md') && f.includes('operating-rules.md')),
      `expected an operating-rules reference failure, got: ${failures.join('; ')}`,
    );
  });
});

test('assertOperatingRulesSingleSource catches prose copied from the rules file', () => {
  const agentsPath = path.join(PLUGIN_ROOT, 'AGENTS.md');
  const copiedSentence = 'Watch mode leaks file handles and produces ambiguous failure output in agent sandboxes.';
  withFileMutation(agentsPath, (original) => `${original}\n${copiedSentence}\n`, () => {
    const failures = collectFailures(crossDocContracts.assertOperatingRulesSingleSource);
    assert.ok(
      failures.some((f) => f.includes('AGENTS.md') && f.includes('copies a sentence')),
      `expected a copied-prose failure, got: ${failures.join('; ')}`,
    );
  });
});
