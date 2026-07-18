#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  PACKAGE_ROOT,
  PORTABLE_SKILLS,
  readText,
  listFiles,
  parseSkillFrontmatter,
} = require('./lib');
const {
  isAllowedDocumentationHost,
} = require('../../twenty-codex-plugin/scripts/validators/lib');

// The portable skills must work after `npx skills add` copies a single skill
// directory into an agent's skill folder, outside the monorepo. Nothing in a
// skill may depend on the Codex wrapper, the monorepo layout, or a sibling
// skill directory.
const FORBIDDEN_PORTABILITY_FRAGMENTS = [
  'packages/twenty-codex-plugin',
  'packages/twenty-agent-skills',
  '.codex-plugin',
  'openai.yaml',
  'AGENTS.md',
  'marketplace.json',
];

const PATH_LIKE_REFERENCE_PATTERN =
  /(?:(?:\.\.\/)+|references\/)[A-Za-z0-9._/-]+\.md/g;

const assertSkillDirectories = (skillsRoot, fail) => {
  if (!fs.existsSync(skillsRoot)) {
    fail('skills/ does not exist; run the build first');
    return [];
  }

  const skillDirectories = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const skillName of PORTABLE_SKILLS) {
    if (!skillDirectories.includes(skillName)) {
      fail(`portable skill is missing: ${skillName}`);
    }
  }

  for (const skillName of skillDirectories) {
    if (!PORTABLE_SKILLS.includes(skillName)) {
      fail(`unexpected skill directory: ${skillName}`);
    }
  }

  return skillDirectories;
};

const assertSkillFrontmatter = (skillsRoot, skillName, fail) => {
  const skillPath = path.join(skillsRoot, skillName, 'SKILL.md');

  if (!fs.existsSync(skillPath)) {
    fail(`${skillName} is missing SKILL.md`);
    return;
  }

  const frontmatter = parseSkillFrontmatter(skillPath);

  if (!frontmatter) {
    fail(`${skillName}/SKILL.md is missing YAML frontmatter`);
    return;
  }

  if (frontmatter.name !== skillName) {
    fail(`${skillName}/SKILL.md frontmatter name must match its directory`);
  }

  if (!frontmatter.description) {
    fail(`${skillName}/SKILL.md frontmatter description is required`);
  }

  const frontmatterKeys = Object.keys(frontmatter);

  if (frontmatterKeys.some((key) => !['description', 'name'].includes(key))) {
    fail(
      `${skillName}/SKILL.md frontmatter should only include name and description`,
    );
  }

  if (!/^#+\s+When To Use\s*$/m.test(readText(skillPath))) {
    fail(`${skillName}/SKILL.md must include a "When To Use" section`);
  }
};

const assertSelfContainedReferences = (skillsRoot, skillName, fail) => {
  const skillRoot = path.join(skillsRoot, skillName);

  for (const filePath of listFiles(skillRoot)) {
    const relativePath = path.relative(skillsRoot, filePath);

    if (path.extname(filePath) !== '.md') {
      fail(`portable skills must only contain markdown files: ${relativePath}`);
      continue;
    }

    const contents = readText(filePath);

    for (const [reference] of contents.matchAll(PATH_LIKE_REFERENCE_PATTERN)) {
      const baseDirectory = reference.startsWith('references/')
        ? skillRoot
        : path.dirname(filePath);
      const resolvedPath = path.resolve(baseDirectory, reference);

      if (!resolvedPath.startsWith(skillRoot + path.sep)) {
        fail(
          `${relativePath} references a path outside its skill directory: ${reference}`,
        );
        continue;
      }

      if (!fs.existsSync(resolvedPath)) {
        fail(`${relativePath} references a missing file: ${reference}`);
      }
    }
  }
};

const assertPortability = (skillsRoot, skillName, fail) => {
  const skillRoot = path.join(skillsRoot, skillName);

  for (const filePath of listFiles(skillRoot)) {
    const relativePath = path.relative(skillsRoot, filePath);
    const contents = readText(filePath);

    for (const fragment of FORBIDDEN_PORTABILITY_FRAGMENTS) {
      if (contents.includes(fragment)) {
        fail(
          `${relativePath} must not depend on non-portable content: ${fragment}`,
        );
      }
    }

    for (const [rawUrl] of contents.matchAll(/https?:\/\/[^\s"`'<>)]*/g)) {
      if (/[${}*]/.test(rawUrl)) {
        continue;
      }

      let parsedUrl;

      try {
        parsedUrl = new URL(rawUrl);
      } catch {
        continue;
      }

      if (!isAllowedDocumentationHost(parsedUrl.hostname)) {
        fail(
          `non-placeholder URL found in ${relativePath}: ${parsedUrl.origin}`,
        );
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

// Installing two skills side by side must never produce two conflicting
// versions of a shared reference doc.
const assertSharedReferenceConsistency = (
  skillsRoot,
  skillDirectories,
  fail,
) => {
  const referenceContentsByRelativePath = new Map();

  for (const skillName of skillDirectories) {
    const referencesRoot = path.join(skillsRoot, skillName, 'references');

    if (!fs.existsSync(referencesRoot)) {
      continue;
    }

    for (const filePath of listFiles(referencesRoot)) {
      const relativeReference = path.relative(referencesRoot, filePath);
      const contents = readText(filePath);
      const existing = referenceContentsByRelativePath.get(relativeReference);

      if (existing && existing.contents !== contents) {
        fail(
          `shared reference diverges between ${existing.skillName} and ${skillName}: references/${relativeReference}`,
        );
      } else if (!existing) {
        referenceContentsByRelativePath.set(relativeReference, {
          skillName,
          contents,
        });
      }
    }
  }
};

const assertSelfHostedSupport = (skillsRoot, fail) => {
  const createAppPath = path.join(skillsRoot, 'create-app', 'SKILL.md');
  const setupPath = path.join(
    skillsRoot,
    'use-twenty-mcp',
    'references',
    'use-twenty-mcp',
    'setup.md',
  );

  if (
    fs.existsSync(createAppPath) &&
    !readText(createAppPath).includes('self-hosted')
  ) {
    fail(
      'create-app/SKILL.md must present self-hosted instances as a supported target',
    );
  }

  if (
    fs.existsSync(setupPath) &&
    !readText(setupPath).includes('Never require a `twenty.com` workspace')
  ) {
    fail('use-twenty-mcp setup.md must not require a twenty.com workspace');
  }
};

const validatePortableSkills = (skillsRoot, fail) => {
  const skillDirectories = assertSkillDirectories(skillsRoot, fail);

  for (const skillName of skillDirectories) {
    assertSkillFrontmatter(skillsRoot, skillName, fail);
    assertSelfContainedReferences(skillsRoot, skillName, fail);
    assertPortability(skillsRoot, skillName, fail);
  }

  assertSharedReferenceConsistency(skillsRoot, skillDirectories, fail);
  assertSelfHostedSupport(skillsRoot, fail);
};

if (require.main === module) {
  const failures = [];

  validatePortableSkills(path.join(PACKAGE_ROOT, 'skills'), (message) =>
    failures.push(message),
  );

  if (failures.length > 0) {
    console.error('Twenty agent skills validation failed:');

    for (const failure of failures) {
      console.error(`- ${failure}`);
    }

    process.exit(1);
  }

  console.log('Twenty agent skills validation passed.');
}

module.exports = {
  FORBIDDEN_PORTABILITY_FRAGMENTS,
  assertSkillDirectories,
  assertSkillFrontmatter,
  assertSelfContainedReferences,
  assertPortability,
  assertSharedReferenceConsistency,
  assertSelfHostedSupport,
  validatePortableSkills,
};
