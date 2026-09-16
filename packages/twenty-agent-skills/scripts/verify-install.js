#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

import {
  DISTRIBUTION_ROOT,
  CANONICAL_SKILL_NAMES,
  listFiles,
  readText,
} from './lib.js';
import {
  assertSelfContainedReferences,
  assertSkillFrontmatter,
} from './validate-distribution.js';

const [installRoot, ...requestedSkills] = process.argv.slice(2);

if (!installRoot) {
  console.error(
    'usage: verify-install.js <install-root> [skill-name...]\n' +
      'Verifies that skills installed by the `skills` CLI are complete and self-contained.',
  );
  process.exit(1);
}

const skillNames =
  requestedSkills.length > 0 ? requestedSkills : CANONICAL_SKILL_NAMES;

// assertSelfContainedReferences resolves references to absolute paths, so the
// roots it compares them against must be absolute too.
const absoluteInstallRoot = path.resolve(installRoot);

// `skills add` writes to an agent-specific directory (.agents/skills, .claude/skills,
// .codex/skills, ...) and may symlink between them, so the installed copies are
// discovered rather than assumed.
const findInstalledSkillRoots = ({ root, skillName }) => {
  const found = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);

      if (
        !fs.existsSync(absolutePath) ||
        !fs.statSync(absolutePath).isDirectory()
      ) {
        continue;
      }

      if (
        entry.name === skillName &&
        fs.existsSync(path.join(absolutePath, 'SKILL.md'))
      ) {
        found.push(absolutePath);
        continue;
      }

      walk(absolutePath);
    }
  };

  walk(root);

  return found;
};

const relativeFiles = (root) =>
  listFiles(root)
    .map((filePath) => path.relative(root, filePath))
    .sort();

const failures = [];
const fail = (message) => failures.push(message);

for (const skillName of skillNames) {
  const sourceRoot = path.join(DISTRIBUTION_ROOT, 'skills', skillName);
  const installedRoots = findInstalledSkillRoots({
    root: absoluteInstallRoot,
    skillName,
  });

  if (installedRoots.length === 0) {
    fail(
      `${skillName} was not installed anywhere under ${absoluteInstallRoot}`,
    );
    continue;
  }

  const expectedFiles = relativeFiles(sourceRoot);

  for (const installedRoot of installedRoots) {
    const location = path.relative(absoluteInstallRoot, installedRoot);
    const installedFiles = relativeFiles(installedRoot);

    for (const relativePath of expectedFiles) {
      if (!installedFiles.includes(relativePath)) {
        fail(`${location} is missing ${relativePath}`);
        continue;
      }

      if (
        readText(path.join(sourceRoot, relativePath)) !==
        readText(path.join(installedRoot, relativePath))
      ) {
        fail(`${location} installed a modified ${relativePath}`);
      }
    }

    for (const relativePath of installedFiles) {
      if (!expectedFiles.includes(relativePath)) {
        fail(`${location} has an unexpected ${relativePath}`);
      }
    }

    // Every relative link inside every installed file must resolve inside the
    // installed directory; that is the "no manual fixes after installation" bar.
    assertSelfContainedReferences({
      skillsRoot: path.dirname(installedRoot),
      skillName,
      fail,
    });
    assertSkillFrontmatter({
      skillsRoot: path.dirname(installedRoot),
      skillName,
      fail,
    });

    console.log(
      `${skillName}: ${installedFiles.length} files verified in ${location}`,
    );
  }
}

if (failures.length > 0) {
  console.error('Installed Twenty agent skills failed verification:');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log(`Verified ${skillNames.length} installed skill(s).`);
