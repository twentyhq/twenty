const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, beforeEach, describe, it } = require('node:test');

const { PORTABLE_SKILLS } = require('../lib');
const {
  assertSkillFrontmatter,
  assertSelfContainedReferences,
  assertPortability,
  assertSharedReferenceConsistency,
  validatePortableSkills,
} = require('../validate');

const writeFixtureFile = (root, relativePath, contents) => {
  const absolutePath = path.join(root, relativePath);

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents);
};

const writeValidSkill = (skillsRoot, skillName) => {
  writeFixtureFile(
    skillsRoot,
    `${skillName}/SKILL.md`,
    `---\nname: ${skillName}\ndescription: Demo skill.\n---\n\n# When To Use\n\nRead \`references/concepts/basics.md\`.\n`,
  );
  writeFixtureFile(
    skillsRoot,
    `${skillName}/references/concepts/basics.md`,
    'Basics.\n',
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
    for (const skillName of PORTABLE_SKILLS) {
      writeValidSkill(skillsRoot, skillName);
    }

    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: create-app\ndescription: Demo skill.\n---\n\n# When To Use\n\nWorks against self-hosted instances.\n',
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

    assertSkillFrontmatter(skillsRoot, 'create-app', fail);

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

    assertSkillFrontmatter(skillsRoot, 'create-app', fail);

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

    assertSelfContainedReferences(skillsRoot, 'create-app', fail);

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

    assertSelfContainedReferences(skillsRoot, 'create-app', fail);

    assert.ok(
      failures.includes(
        'create-app/SKILL.md references a missing file: references/concepts/missing.md',
      ),
    );
  });

  it('should fail when a skill ships non-markdown files', () => {
    writeValidSkill(skillsRoot, 'create-app');
    writeFixtureFile(
      skillsRoot,
      'create-app/agents/openai.yaml',
      'interface: {}\n',
    );

    assertSelfContainedReferences(skillsRoot, 'create-app', fail);

    assert.ok(
      failures.includes(
        'portable skills must only contain markdown files: create-app/agents/openai.yaml',
      ),
    );
  });

  it('should fail when content depends on the codex plugin wrapper', () => {
    writeFixtureFile(
      skillsRoot,
      'create-app/SKILL.md',
      '---\nname: create-app\ndescription: Demo.\n---\n\n# When To Use\n\nRun `bash packages/twenty-codex-plugin/scripts/setup-mcp.sh`.\n',
    );

    assertPortability(skillsRoot, 'create-app', fail);

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

    assertPortability(skillsRoot, 'create-app', fail);

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
