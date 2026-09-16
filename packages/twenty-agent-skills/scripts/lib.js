import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CANONICAL_SKILL_NAMES,
  readText,
  listFiles,
} from './validators/lib.js';

const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const DISTRIBUTION_ROOT = path.join(PACKAGE_ROOT, 'dist');

const SKILL_REFERENCE_PATTERN =
  /(?:\.\.\/\.\.\/)?references\/([A-Za-z0-9._/-]+\.md)/g;
const SIBLING_REFERENCE_PATTERN =
  /\.\.\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+\.md)/g;
const SAME_DIRECTORY_REFERENCE_PATTERN = /`([A-Za-z0-9._-]+\.md)`/g;

const findReferenceByBasename = ({ referencesRoot, basename }) => {
  for (const filePath of listFiles(referencesRoot)) {
    if (path.basename(filePath) === basename) {
      return path.relative(referencesRoot, filePath).split(path.sep).join('/');
    }
  }

  return undefined;
};

const rewriteSkillReferenceLinks = (skillMarkdown) =>
  skillMarkdown.replaceAll('../../references/', 'references/');

const collectSkillSeedReferences = (skillMarkdown) => {
  const seeds = new Set();

  for (const match of skillMarkdown.matchAll(SKILL_REFERENCE_PATTERN)) {
    seeds.add(match[1]);
  }

  return seeds;
};

// Expands the seed set with every reference doc reachable through relative
// mentions (`../<scope>/<file>.md` or same-directory `<file>.md`) so an
// installed skill never points at a file that was not copied with it.
const resolveReferenceClosure = (referencesRoot, seedReferences) => {
  const closure = new Set();
  const queue = [...seedReferences];

  while (queue.length > 0) {
    const relativeReference = queue.shift();

    if (closure.has(relativeReference)) {
      continue;
    }

    const absolutePath = path.join(referencesRoot, relativeReference);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(
        `referenced doc does not exist: references/${relativeReference}`,
      );
    }

    closure.add(relativeReference);

    const contents = readText(absolutePath);
    const scope = path.dirname(relativeReference);

    for (const match of contents.matchAll(SIBLING_REFERENCE_PATTERN)) {
      queue.push(path.posix.join(match[1], match[2]));
    }

    for (const match of contents.matchAll(SAME_DIRECTORY_REFERENCE_PATTERN)) {
      const candidate = path.posix.join(scope, match[1]);

      // Backtick mentions also match non-file tokens such as
      // `themeCssVariables.font.size.md`; only real sibling docs are queued.
      if (fs.existsSync(path.join(referencesRoot, candidate))) {
        queue.push(candidate);
        continue;
      }

      // A bare mention that names a reference doc living in another scope would
      // otherwise be dropped here, shipping a skill that points at a file it
      // does not carry. Make the author write the explicit relative path.
      const elsewhere = findReferenceByBasename({
        referencesRoot,
        basename: match[1],
      });

      if (elsewhere) {
        throw new Error(
          `references/${relativeReference} mentions \`${match[1]}\` as a same-directory file, but it lives at references/${elsewhere}. Use an explicit relative path such as \`${path.posix.relative(scope, elsewhere)}\`.`,
        );
      }
    }
  }

  return closure;
};

const buildPortableSkills = ({
  sourceRoot = PACKAGE_ROOT,
  outputRoot,
  skillNames = CANONICAL_SKILL_NAMES,
}) => {
  const referencesRoot = path.join(sourceRoot, 'references');

  fs.rmSync(outputRoot, { recursive: true, force: true });

  for (const skillName of skillNames) {
    const sourceSkillPath = path.join(
      sourceRoot,
      'skills',
      skillName,
      'SKILL.md',
    );

    if (!fs.existsSync(sourceSkillPath)) {
      throw new Error(
        `canonical skill is missing: skills/${skillName}/SKILL.md`,
      );
    }

    const skillMarkdown = readText(sourceSkillPath);
    const outputSkillRoot = path.join(outputRoot, skillName);

    fs.cpSync(path.dirname(sourceSkillPath), outputSkillRoot, {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(outputSkillRoot, 'SKILL.md'),
      rewriteSkillReferenceLinks(skillMarkdown),
    );

    const seedReferences = collectSkillSeedReferences(skillMarkdown);
    const referenceClosure = resolveReferenceClosure(
      referencesRoot,
      seedReferences,
    );

    for (const relativeReference of [...referenceClosure].sort()) {
      const outputReferencePath = path.join(
        outputSkillRoot,
        'references',
        relativeReference,
      );

      fs.mkdirSync(path.dirname(outputReferencePath), { recursive: true });
      fs.copyFileSync(
        path.join(referencesRoot, relativeReference),
        outputReferencePath,
      );
    }
  }
};

const buildDistribution = ({
  sourceRoot = PACKAGE_ROOT,
  outputRoot = DISTRIBUTION_ROOT,
} = {}) => {
  const packageJson = JSON.parse(
    readText(path.join(sourceRoot, 'package.json')),
  );

  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  for (const relativePath of packageJson.files) {
    if (relativePath !== 'skills') {
      fs.cpSync(
        path.join(sourceRoot, relativePath),
        path.join(outputRoot, relativePath),
        {
          recursive: true,
        },
      );
    }
  }

  buildPortableSkills({
    sourceRoot,
    outputRoot: path.join(outputRoot, 'skills'),
  });
  const { name, version, description, license, files } = packageJson;

  fs.writeFileSync(
    path.join(outputRoot, 'package.json'),
    JSON.stringify(
      { name, version, description, license, private: true, files },
      null,
      2,
    ) + '\n',
  );
};

export {
  PACKAGE_ROOT,
  DISTRIBUTION_ROOT,
  CANONICAL_SKILL_NAMES,
  readText,
  listFiles,
  rewriteSkillReferenceLinks,
  findReferenceByBasename,
  collectSkillSeedReferences,
  resolveReferenceClosure,
  buildPortableSkills,
  buildDistribution,
};
