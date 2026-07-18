const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, beforeEach, describe, it } = require('node:test');

const {
  rewriteSkillReferenceLinks,
  collectSkillSeedReferences,
  resolveReferenceClosure,
  buildPortableSkills,
  diffDirectories,
} = require('../lib');

const writeFixtureFile = (root, relativePath, contents) => {
  const absolutePath = path.join(root, relativePath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents);
};

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

  it('should emit a self-contained skill without codex-specific files', () => {
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
    assert.ok(!fs.existsSync(path.join(outputRoot, 'demo-skill', 'agents')));
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

describe('diffDirectories', () => {
  let expectedRoot;
  let actualRoot;

  beforeEach(() => {
    expectedRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'agent-skills-expected-'),
    );
    actualRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-actual-'));
  });

  afterEach(() => {
    fs.rmSync(expectedRoot, { recursive: true, force: true });
    fs.rmSync(actualRoot, { recursive: true, force: true });
  });

  it('should report missing, outdated, and unexpected files', () => {
    writeFixtureFile(expectedRoot, 'a.md', 'same');
    writeFixtureFile(actualRoot, 'a.md', 'same');
    writeFixtureFile(expectedRoot, 'missing.md', 'expected');
    writeFixtureFile(expectedRoot, 'outdated.md', 'new content');
    writeFixtureFile(actualRoot, 'outdated.md', 'old content');
    writeFixtureFile(actualRoot, 'unexpected.md', 'extra');

    assert.deepEqual(diffDirectories(expectedRoot, actualRoot).sort(), [
      'missing file: missing.md',
      'outdated file: outdated.md',
      'unexpected file: unexpected.md',
    ]);
  });

  it('should report no differences for identical trees', () => {
    writeFixtureFile(expectedRoot, 'nested/a.md', 'same');
    writeFixtureFile(actualRoot, 'nested/a.md', 'same');

    assert.deepEqual(diffDirectories(expectedRoot, actualRoot), []);
  });
});
