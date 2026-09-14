const fs = require('node:fs');
const path = require('node:path');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const CODEX_PLUGIN_ROOT = path.resolve(
  PACKAGE_ROOT,
  '..',
  'twenty-codex-plugin',
);

// The portable collection is generated from the canonical skill content in
// packages/twenty-codex-plugin. Codex-only wrapper files (.codex-plugin,
// .mcp.json, agents/openai.yaml, setup-mcp.sh) are intentionally left behind.
const PORTABLE_SKILLS = [
  'create-app',
  'develop-app',
  'manage-app',
  'publish-app',
  'use-twenty-mcp',
];

const SKILL_REFERENCE_PATTERN =
  /(?:\.\.\/\.\.\/)?references\/([A-Za-z0-9._/-]+\.md)/g;
const SIBLING_REFERENCE_PATTERN =
  /\.\.\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+\.md)/g;
const SAME_DIRECTORY_REFERENCE_PATTERN = /`([A-Za-z0-9._-]+\.md)`/g;

const readText = (filePath) => fs.readFileSync(filePath, 'utf8');

const listFiles = (directory) => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listFiles(absolutePath));
    } else {
      files.push(absolutePath);
    }
  }

  return files.sort();
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
      }
    }
  }

  return closure;
};

const buildPortableSkills = ({
  sourceRoot = CODEX_PLUGIN_ROOT,
  outputRoot,
  skillNames = PORTABLE_SKILLS,
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

    fs.mkdirSync(outputSkillRoot, { recursive: true });
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

const diffDirectories = (expectedRoot, actualRoot) => {
  const relativize = (root, files) =>
    files.map((filePath) => path.relative(root, filePath));
  const expectedFiles = fs.existsSync(expectedRoot)
    ? relativize(expectedRoot, listFiles(expectedRoot))
    : [];
  const actualFiles = fs.existsSync(actualRoot)
    ? relativize(actualRoot, listFiles(actualRoot))
    : [];
  const differences = [];

  for (const relativePath of expectedFiles) {
    if (!actualFiles.includes(relativePath)) {
      differences.push(`missing file: ${relativePath}`);
    } else if (
      readText(path.join(expectedRoot, relativePath)) !==
      readText(path.join(actualRoot, relativePath))
    ) {
      differences.push(`outdated file: ${relativePath}`);
    }
  }

  for (const relativePath of actualFiles) {
    if (!expectedFiles.includes(relativePath)) {
      differences.push(`unexpected file: ${relativePath}`);
    }
  }

  return differences;
};

const parseSkillFrontmatter = (skillPath) => {
  const contents = readText(skillPath);
  const match = contents.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    return undefined;
  }

  const frontmatter = {};

  for (const line of match[1].split('\n')) {
    const fieldMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);

    if (fieldMatch) {
      frontmatter[fieldMatch[1]] = fieldMatch[2].replace(/^["']|["']$/g, '');
    }
  }

  return frontmatter;
};

module.exports = {
  PACKAGE_ROOT,
  CODEX_PLUGIN_ROOT,
  PORTABLE_SKILLS,
  readText,
  listFiles,
  rewriteSkillReferenceLinks,
  collectSkillSeedReferences,
  resolveReferenceClosure,
  buildPortableSkills,
  diffDirectories,
  parseSkillFrontmatter,
};
