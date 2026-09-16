import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { CANONICAL_SKILL_NAMES } from '../lib.js';
import {
  assertSkillFrontmatter,
  assertSelfContainedReferences,
  assertPortability,
  assertSharedReferenceConsistency,
  assertOperatingRulesShipped,
  assertNoDanglingDocMentions,
  validatePortableSkills,
} from '../validate-distribution.js';
import { writeFixtureFile } from './fixtures.js';

const writeValidSkill = (skillsRoot, skillName) => {
  writeFixtureFile(
    skillsRoot,
    `${skillName}/SKILL.md`,
    `---\nname: ${skillName}\ndescription: Demo skill.\n---\n\n# When To Use\n\nRead \`references/concepts/basics.md\` and \`references/concepts/operating-rules.md\`.\n`,
  );
  writeFixtureFile(
    skillsRoot,
    `${skillName}/references/concepts/basics.md`,
    'Basics.\n',
  );
  writeFixtureFile(
    skillsRoot,
    `${skillName}/references/concepts/operating-rules.md`,
    'Rules.\n',
  );
};

describe('validatePortableSkills', () => {
  let skillsRoot;
  let failures;
  const fail = (message) => failures.push(message);

  beforeEach(() => {
    skillsRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'agent-skills-validate-'),
    );
    failures = [];
  });

  afterEach(() => {
    fs.rmSync(skillsRoot, { recursive: true, force: true });
  });

  it('should pass for a complete, self-contained skill set', () => {
    for (const skillName of CANONICAL_SKILL_NAMES) {
      writeValidSkill(skillsRoot, skillName);
    }

    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: create-app\ndescription: Demo skill.\n---\n\n# When To Use\n\nWorks against self-hosted instances. Read `references/concepts/operating-rules.md`.\n',
    );

    validatePortableSkills(skillsRoot, fail);

    assert.deepEqual(failures, []);
  });

  it('should fail when a portable skill is missing or unexpected', () => {
    writeValidSkill(skillsRoot, 'create-app');
    writeValidSkill(skillsRoot, 'not-a-twenty-skill');

    validatePortableSkills(skillsRoot, fail);

    assert.ok(failures.includes('portable skill is missing: develop-app'));
    assert.ok(
      failures.includes('unexpected skill directory: not-a-twenty-skill'),
    );
  });

  it('should fail when frontmatter name does not match the directory', () => {
    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: other-name\ndescription: Demo.\n---\n\n# When To Use\n\nText.\n',
    );

    assertSkillFrontmatter({ skillsRoot, skillName: 'create-app', fail });

    assert.ok(
      failures.includes(
        'create-app/SKILL.md frontmatter name must match its directory',
      ),
    );
  });

  it('should fail when frontmatter includes extra fields or misses the trigger section', () => {
    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: create-app\ndescription: Demo.\nlicense: MIT\n---\n\nNo trigger section.\n',
    );

    assertSkillFrontmatter({ skillsRoot, skillName: 'create-app', fail });

    assert.ok(
      failures.includes(
        'create-app/SKILL.md frontmatter should only include name and description',
      ),
    );
    assert.ok(
      failures.includes(
        'create-app/SKILL.md must include a "When To Use" section',
      ),
    );
  });

  it('should fail when a reference escapes the skill directory', () => {
    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: create-app\ndescription: Demo.\n---\n\n# When To Use\n\nRead `../../references/concepts/basics.md`.\n',
    );

    assertSelfContainedReferences({
      skillsRoot,
      skillName: 'create-app',
      fail,
    });

    assert.ok(
      failures.some((failure) =>
        failure.includes('references a path outside its skill directory'),
      ),
    );
  });

  it('should fail when a referenced file is missing after installation', () => {
    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: create-app\ndescription: Demo.\n---\n\n# When To Use\n\nRead `references/concepts/missing.md`.\n',
    );

    assertSelfContainedReferences({
      skillsRoot,
      skillName: 'create-app',
      fail,
    });

    assert.ok(
      failures.includes(
        'create-app/SKILL.md references a missing file: references/concepts/missing.md',
      ),
    );
  });

  it('should fail when a skill ships an unexpected executable file', () => {
    writeValidSkill(skillsRoot, 'create-app');
    writeFixtureFile(skillsRoot, 'create-app/script.js', 'console.log(1);\n');

    assertSelfContainedReferences({
      skillsRoot,
      skillName: 'create-app',
      fail,
    });

    assert.ok(
      failures.includes(
        'portable skills may only contain markdown and agents/openai.yaml: create-app/script.js',
      ),
    );
  });

  it('should fail when content depends on the codex plugin wrapper', () => {
    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: create-app\ndescription: Demo.\n---\n\n# When To Use\n\nRun `bash packages/twenty-codex-plugin/scripts/setup-mcp.sh`.\n',
    );

    assertPortability({ skillsRoot, skillName: 'create-app', fail });

    assert.ok(
      failures.includes(
        'create-app/SKILL.md must not depend on non-portable content: packages/twenty-codex-plugin',
      ),
    );
  });

  it('should fail on non-placeholder URLs', () => {
    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: create-app\ndescription: Demo.\n---\n\n# When To Use\n\nVisit https://some-random-host.dev/docs.\n',
    );

    assertPortability({ skillsRoot, skillName: 'create-app', fail });

    assert.ok(
      failures.includes(
        'non-placeholder URL found in create-app/SKILL.md: https://some-random-host.dev',
      ),
    );
  });

  it('should fail when a shared reference diverges between skills', () => {
    writeValidSkill(skillsRoot, 'create-app');
    writeValidSkill(skillsRoot, 'develop-app');
    writeFixtureFile(
      skillsRoot,
      'develop-app/references/concepts/basics.md',
      'Diverged basics.\n',
    );

    assertSharedReferenceConsistency(
      skillsRoot,
      ['create-app', 'develop-app'],
      fail,
    );

    assert.deepEqual(failures, [
      'shared reference diverges between create-app and develop-app: references/concepts/basics.md',
    ]);
  });
});

describe('assertOperatingRulesShipped', () => {
  let skillsRoot;
  let failures;
  const fail = (message) => failures.push(message);

  beforeEach(() => {
    skillsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-skills-rules-'));
    failures = [];
  });

  afterEach(() => {
    fs.rmSync(skillsRoot, { recursive: true, force: true });
  });

  it('should fail when an app skill does not ship the operating rules', () => {
    for (const skillName of CANONICAL_SKILL_NAMES) {
      writeValidSkill(skillsRoot, skillName);
    }

    fs.rmSync(
      path.join(
        skillsRoot,
        'manage-app/references/concepts/operating-rules.md',
      ),
    );

    assertOperatingRulesShipped(skillsRoot, fail);

    assert.ok(
      failures.some((failure) =>
        failure.startsWith('manage-app does not ship'),
      ),
      `expected a missing operating-rules failure, got: ${failures.join('; ')}`,
    );
  });

  it('should fail when an app skill does not link to the operating rules', () => {
    for (const skillName of CANONICAL_SKILL_NAMES) {
      writeValidSkill(skillsRoot, skillName);
    }

    writeFixtureFile(
      skillsRoot,
      'publish-app/SKILL.md',
      '---\nname: publish-app\ndescription: Demo skill.\n---\n\n# When To Use\n\nNo rules link here.\n',
    );

    assertOperatingRulesShipped(skillsRoot, fail);

    assert.ok(
      failures.some((failure) =>
        failure.includes('publish-app/SKILL.md must link'),
      ),
      `expected a missing link failure, got: ${failures.join('; ')}`,
    );
  });
});

describe('assertNoDanglingDocMentions', () => {
  let skillsRoot;
  let failures;
  const fail = (message) => failures.push(message);

  beforeEach(() => {
    skillsRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'agent-skills-mentions-'),
    );
    failures = [];
  });

  afterEach(() => {
    fs.rmSync(skillsRoot, { recursive: true, force: true });
  });

  it('should fail when a skill mentions a doc another skill ships but it does not', () => {
    writeValidSkill(skillsRoot, 'create-app');
    writeValidSkill(skillsRoot, 'develop-app');
    writeFixtureFile(
      skillsRoot,
      'develop-app/references/develop-app/front-components.md',
      'Front components.\n',
    );
    writeFixtureFile(
      skillsRoot,
      'create-app/references/design/front-component-ui.md',
      'Use `front-components.md` for exact imports.\n',
    );

    assertNoDanglingDocMentions(
      skillsRoot,
      ['create-app', 'develop-app'],
      fail,
    );

    assert.ok(
      failures.some(
        (failure) =>
          failure.includes('front-components.md') &&
          failure.includes('create-app does not ship'),
      ),
      `expected a dangling mention failure, got: ${failures.join('; ')}`,
    );
  });

  it('should ignore filenames that belong to the user rather than the collection', () => {
    writeValidSkill(skillsRoot, 'publish-app');
    writeFixtureFile(
      skillsRoot,
      'publish-app/references/concepts/basics.md',
      'Inspect `README.md` and `package.json` in the app.\n',
    );

    assertNoDanglingDocMentions(skillsRoot, ['publish-app'], fail);

    assert.deepEqual(failures, []);
  });
});

describe('verify-install argument handling', () => {
  let installRoot;

  beforeEach(() => {
    installRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'agent-skills-install-'),
    );
  });

  afterEach(() => {
    fs.rmSync(installRoot, { recursive: true, force: true });
  });

  it('should not report escaping references when given a relative install root', () => {
    const failures = [];
    const fail = (message) => failures.push(message);

    writeValidSkill(installRoot, 'create-app');
    assertSelfContainedReferences({
      skillsRoot: path.resolve(installRoot),
      skillName: 'create-app',
      fail,
    });

    assert.deepEqual(failures, []);
  });
});
