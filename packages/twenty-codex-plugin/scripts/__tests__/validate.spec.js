const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const PLUGIN_ROOT = path.resolve(__dirname, '..', '..');
const PLUGIN_JSON_PATH = path.join(PLUGIN_ROOT, '.codex-plugin', 'plugin.json');
const PACKAGE_JSON_PATH = path.join(PLUGIN_ROOT, 'package.json');
const MCP_JSON_PATH = path.join(PLUGIN_ROOT, '.mcp.json');
const MARKETPLACE_TEMPLATE_PATH = path.join(PLUGIN_ROOT, 'templates', 'marketplace.example.json');

const metadata = require('../validators/metadata');
const assets = require('../validators/assets');
const skills = require('../validators/skills');
const references = require('../validators/references');
const crossDocContracts = require('../validators/cross-doc-contracts');
const setupHelper = require('../validators/setup-helper');

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

test('assertCliGuidanceSplit passes on current state', () => {
  assert.deepStrictEqual(collectFailures(crossDocContracts.assertCliGuidanceSplit), []);
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

test('assertJsonMetadata catches a shipped apps declaration in plugin.json', () => {
  withJsonMutation(PLUGIN_JSON_PATH, (plugin) => {
    plugin.apps = './.app.json';
  }, () => {
    const failures = collectFailures(metadata.assertJsonMetadata);
    assert.ok(failures.some((f) => f.includes('must not declare apps')));
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

test('assertNoBundledMcpConfig catches a nested .app.json', () => {
  const stubDir = path.join(PLUGIN_ROOT, 'scratch-app');
  const stub = path.join(stubDir, '.app.json');
  fs.mkdirSync(stubDir, { recursive: true });
  withExtraFile(stub, '{}', () => {
    const failures = collectFailures(metadata.assertNoBundledMcpConfig);
    assert.ok(failures.some((f) => f.includes('app declarations must not be shipped')));
  });
  fs.rmSync(stubDir, { recursive: true, force: true });
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

test('assertMarketplaceTemplate catches version drift', () => {
  withJsonMutation(MARKETPLACE_TEMPLATE_PATH, (t) => {
    t.plugins[0].version = '0.0.0';
  }, () => {
    const failures = collectFailures(metadata.assertMarketplaceTemplate);
    assert.ok(failures.some((f) => f.includes('version must match')));
  });
});

test('assertMarketplaceTemplate catches deprecated source type', () => {
  withJsonMutation(MARKETPLACE_TEMPLATE_PATH, (t) => {
    t.plugins[0].source.type = 'local';
    delete t.plugins[0].source.source;
  }, () => {
    const failures = collectFailures(metadata.assertMarketplaceTemplate);
    assert.ok(failures.some((f) => f.includes('source.source')));
    assert.ok(failures.some((f) => f.includes('source.type is deprecated')));
  });
});

test('assertMarketplaceTemplate catches lowercase policy values', () => {
  withJsonMutation(MARKETPLACE_TEMPLATE_PATH, (t) => {
    t.plugins[0].policy.installation = 'manual';
    t.plugins[0].policy.authentication = 'user-local';
  }, () => {
    const failures = collectFailures(metadata.assertMarketplaceTemplate);
    assert.ok(failures.some((f) => f.includes('installation must be AVAILABLE')));
    assert.ok(failures.some((f) => f.includes('authentication must be ON_INSTALL')));
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
