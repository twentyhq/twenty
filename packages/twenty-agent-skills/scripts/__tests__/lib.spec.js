import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import {
  rewriteSkillReferenceLinks,
  collectSkillSeedReferences,
  resolveReferenceClosure,
  buildPortableSkills,
  buildDistribution,
  CANONICAL_SKILL_NAMES,
  listFiles,
} from '../lib.js';
import { writeFixtureFile } from './fixtures.js';

describe('rewriteSkillReferenceLinks', () => {
  it('should rewrite plugin-relative reference links to skill-relative links', () => {
    const rewritten = rewriteSkillReferenceLinks(
      'Read `../../references/concepts/how-apps-work.md` and `../../references/develop-app/tests.md`.',
    );

    assert.equal(
      rewritten,
      'Read `references/concepts/how-apps-work.md` and `references/develop-app/tests.md`.',
    );
  });

  it('should leave skill-relative links untouched', () => {
    const contents = 'Read `references/concepts/how-apps-work.md`.';

    assert.equal(rewriteSkillReferenceLinks(contents), contents);
  });
});

describe('collectSkillSeedReferences', () => {
  it('should collect plugin-relative and skill-relative reference mentions', () => {
    const seeds = collectSkillSeedReferences(
      'Read `../../references/concepts/how-apps-work.md` then `references/design/front-component-ui.md`.',
    );

    assert.deepEqual([...seeds].sort(), [
      'concepts/how-apps-work.md',
      'design/front-component-ui.md',
    ]);
  });
});

describe('resolveReferenceClosure', () => {
  let fixtureRoot;

  beforeEach(() => {
    fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-lib-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it('should follow sibling-scope and same-directory reference mentions transitively', () => {
    writeFixtureFile(fixtureRoot, 'references/a/one.md', 'See `../b/two.md`.');
    writeFixtureFile(fixtureRoot, 'references/b/two.md', 'See `three.md`.');
    writeFixtureFile(fixtureRoot, 'references/b/three.md', 'Terminal doc.');

    const closure = resolveReferenceClosure(
      path.join(fixtureRoot, 'references'),
      new Set(['a/one.md']),
    );

    assert.deepEqual([...closure].sort(), [
      'a/one.md',
      'b/three.md',
      'b/two.md',
    ]);
  });

  it('should ignore backtick tokens that only look like markdown files', () => {
    writeFixtureFile(
      fixtureRoot,
      'references/design/ui.md',
      'Use `themeCssVariables.font.size.md` for medium font size.',
    );

    const closure = resolveReferenceClosure(
      path.join(fixtureRoot, 'references'),
      new Set(['design/ui.md']),
    );

    assert.deepEqual([...closure], ['design/ui.md']);
  });

  it('should throw when a referenced doc does not exist', () => {
    writeFixtureFile(
      fixtureRoot,
      'references/a/one.md',
      'See `../b/missing.md`.',
    );

    assert.throws(
      () =>
        resolveReferenceClosure(
          path.join(fixtureRoot, 'references'),
          new Set(['a/one.md']),
        ),
      /referenced doc does not exist: references\/b\/missing\.md/,
    );
  });
});

describe('buildPortableSkills', () => {
  let sourceRoot;
  let outputRoot;

  beforeEach(() => {
    sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-source-'));
    outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-output-'));
    writeFixtureFile(
      sourceRoot,
      'skills/demo-skill/SKILL.md',
      '---\nname: demo-skill\ndescription: Demo.\n---\n\nRead `../../references/concepts/basics.md`.\n',
    );
    writeFixtureFile(
      sourceRoot,
      'skills/demo-skill/agents/openai.yaml',
      'interface: {}\n',
    );
    writeFixtureFile(
      sourceRoot,
      'references/concepts/basics.md',
      'See `../deep/detail.md`.',
    );
    writeFixtureFile(sourceRoot, 'references/deep/detail.md', 'Terminal doc.');
  });

  afterEach(() => {
    fs.rmSync(sourceRoot, { recursive: true, force: true });
    fs.rmSync(outputRoot, { recursive: true, force: true });
  });

  it('should emit a self-contained skill including optional Codex display metadata', () => {
    buildPortableSkills({ sourceRoot, outputRoot, skillNames: ['demo-skill'] });

    const skillMarkdown = fs.readFileSync(
      path.join(outputRoot, 'demo-skill', 'SKILL.md'),
      'utf8',
    );

    assert.match(skillMarkdown, /`references\/concepts\/basics\.md`/);
    assert.ok(
      fs.existsSync(
        path.join(outputRoot, 'demo-skill', 'references/concepts/basics.md'),
      ),
    );
    assert.ok(
      fs.existsSync(
        path.join(outputRoot, 'demo-skill', 'references/deep/detail.md'),
      ),
    );
    assert.equal(
      fs.readFileSync(
        path.join(outputRoot, 'demo-skill', 'agents/openai.yaml'),
        'utf8',
      ),
      'interface: {}\n',
    );
  });

  it('should remove stale files from a previous build', () => {
    writeFixtureFile(outputRoot, 'stale-skill/SKILL.md', 'stale');

    buildPortableSkills({ sourceRoot, outputRoot, skillNames: ['demo-skill'] });

    assert.ok(!fs.existsSync(path.join(outputRoot, 'stale-skill')));
  });

  it('should throw when a canonical skill is missing', () => {
    assert.throws(
      () =>
        buildPortableSkills({
          sourceRoot,
          outputRoot,
          skillNames: ['absent-skill'],
        }),
      /canonical skill is missing: skills\/absent-skill\/SKILL\.md/,
    );
  });
});

describe('resolveReferenceClosure cross-scope mentions', () => {
  let referencesRoot;

  beforeEach(() => {
    referencesRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'agent-skills-closure-'),
    );
  });

  afterEach(() => {
    fs.rmSync(referencesRoot, { recursive: true, force: true });
  });

  it('should throw when a bare mention names a doc that lives in another scope', () => {
    writeFixtureFile(
      referencesRoot,
      'design/front-component-ui.md',
      'Use `front-components.md` for exact imports.\n',
    );
    writeFixtureFile(
      referencesRoot,
      'develop-app/front-components.md',
      'Front components.\n',
    );

    assert.throws(
      () =>
        resolveReferenceClosure(referencesRoot, [
          'design/front-component-ui.md',
        ]),
      /lives at references\/develop-app\/front-components\.md/,
    );
  });

  it('should still ignore bare mentions that name no reference doc', () => {
    writeFixtureFile(
      referencesRoot,
      'publish-app/prepare-for-app-store.md',
      'Write the app `README.md` and set `themeCssVariables.font.size.md`.\n',
    );

    const closure = resolveReferenceClosure(referencesRoot, [
      'publish-app/prepare-for-app-store.md',
    ]);

    assert.deepEqual([...closure], ['publish-app/prepare-for-app-store.md']);
  });
});

describe('buildDistribution', () => {
  let fixtureRoot;

  beforeEach(() => {
    fixtureRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'twenty-distribution-'),
    );
  });

  afterEach(() => {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it('builds one standalone plugin and skill collection without modifying source', () => {
    const sourceRoot = path.join(fixtureRoot, 'source');
    const outputRoot = path.join(fixtureRoot, 'dist');
    const files = [
      '.codex-plugin',
      '.mcp.json',
      'assets',
      'skills',
      'scripts/setup-mcp.sh',
    ];

    writeFixtureFile(
      sourceRoot,
      'package.json',
      JSON.stringify({
        name: 'twenty-agent-skills',
        version: '0.1.0',
        license: 'AGPL-3.0',
        files,
        scripts: { build: 'node scripts/build.js' },
      }),
    );
    writeFixtureFile(
      sourceRoot,
      '.codex-plugin/plugin.json',
      '{"name":"twenty","skills":"./skills/"}',
    );
    writeFixtureFile(sourceRoot, '.mcp.json', '{"mcpServers":{}}');
    writeFixtureFile(sourceRoot, 'assets/logo.png', 'binary-asset');
    writeFixtureFile(sourceRoot, 'scripts/setup-mcp.sh', '#!/bin/sh\nexit 0\n');
    fs.chmodSync(path.join(sourceRoot, 'scripts/setup-mcp.sh'), 0o755);
    writeFixtureFile(sourceRoot, 'scripts/build.js', 'build-only');
    writeFixtureFile(
      sourceRoot,
      'references/concepts/basics.md',
      'Shared concept.',
    );

    for (const skillName of CANONICAL_SKILL_NAMES) {
      writeFixtureFile(
        sourceRoot,
        `skills/${skillName}/SKILL.md`,
        'Read `../../references/concepts/basics.md`.',
      );
      writeFixtureFile(
        sourceRoot,
        `skills/${skillName}/agents/openai.yaml`,
        'interface: {}\n',
      );
    }

    const snapshot = (root) =>
      listFiles(root).map((file) => [
        path.relative(root, file),
        fs.readFileSync(file),
      ]);
    const sourceBefore = snapshot(sourceRoot);
    buildDistribution({ sourceRoot, outputRoot });
    const distributionBefore = snapshot(outputRoot);
    writeFixtureFile(outputRoot, 'removed-skill/SKILL.md', 'stale');
    buildDistribution({ sourceRoot, outputRoot });

    assert.deepEqual(snapshot(sourceRoot), sourceBefore);
    assert.deepEqual(snapshot(outputRoot), distributionBefore);
    assert.ok(
      fs.existsSync(path.join(outputRoot, '.codex-plugin/plugin.json')),
    );
    assert.ok(fs.existsSync(path.join(outputRoot, '.mcp.json')));
    assert.ok(fs.existsSync(path.join(outputRoot, 'assets/logo.png')));
    assert.ok(!fs.existsSync(path.join(outputRoot, 'scripts/build.js')));
    assert.equal(
      fs.statSync(path.join(outputRoot, 'scripts/setup-mcp.sh')).mode & 0o777,
      0o755,
    );
    assert.equal(
      JSON.parse(fs.readFileSync(path.join(outputRoot, 'package.json'), 'utf8'))
        .scripts,
      undefined,
    );

    fs.rmSync(sourceRoot, { recursive: true });
    for (const skillName of CANONICAL_SKILL_NAMES) {
      const skillRoot = path.join(outputRoot, 'skills', skillName);
      assert.equal(
        fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8'),
        'Read `references/concepts/basics.md`.',
      );
      assert.equal(
        fs.readFileSync(
          path.join(skillRoot, 'references/concepts/basics.md'),
          'utf8',
        ),
        'Shared concept.',
      );
      assert.equal(
        fs.readFileSync(path.join(skillRoot, 'agents/openai.yaml'), 'utf8'),
        'interface: {}\n',
      );
      assert.ok(
        listFiles(skillRoot).every((file) => fs.lstatSync(file).isFile()),
      );
    }
  });
});
