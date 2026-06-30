const fs = require('node:fs');
const path = require('node:path');

const {
  PLUGIN_ROOT,
  LEGACY_SKILL_NAMES,
  readText,
  listFiles,
  parseSkillFrontmatter,
  parseQuotedYamlField,
} = require('./lib');

const EXPECTED_CANONICAL_SKILLS = [
  'create-app',
  'develop-app',
  'manage-app',
  'publish-app',
  'use-twenty-mcp',
];

const assertSkills = (fail) => {
  const skillsRoot = path.join(PLUGIN_ROOT, 'skills');
  const skillDirectories = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const skillName of EXPECTED_CANONICAL_SKILLS) {
    if (!skillDirectories.includes(skillName)) {
      fail(`canonical skill is missing: ${skillName}`);
    }
  }

  for (const skillName of LEGACY_SKILL_NAMES) {
    if (skillDirectories.includes(skillName)) {
      fail(`legacy skill directory must be transferred out of skills/: ${skillName}`);
    }
  }

  for (const skillName of skillDirectories) {
    const skillPath = path.join(skillsRoot, skillName, 'SKILL.md');
    const agentsPath = path.join(skillsRoot, skillName, 'agents', 'openai.yaml');

    if (!fs.existsSync(skillPath)) {
      fail(`${skillName} is missing SKILL.md`);
      continue;
    }

    const frontmatter = parseSkillFrontmatter(skillPath);

    if (!frontmatter) {
      fail(`${skillName}/SKILL.md is missing YAML frontmatter`);
    } else {
      const frontmatterKeys = Object.keys(frontmatter).sort();

      if (frontmatter.name !== skillName) {
        fail(`${skillName}/SKILL.md frontmatter name must match its directory`);
      }

      if (!frontmatter.description) {
        fail(`${skillName}/SKILL.md frontmatter description is required`);
      }

      if (frontmatterKeys.some((key) => !['description', 'name'].includes(key))) {
        fail(`${skillName}/SKILL.md frontmatter should only include name and description`);
      }
    }

    if (!fs.existsSync(agentsPath)) {
      fail(`${skillName} is missing agents/openai.yaml`);
      continue;
    }

    const agentsYaml = readText(agentsPath);
    const displayName = parseQuotedYamlField(agentsYaml, 'display_name');
    const shortDescription = parseQuotedYamlField(agentsYaml, 'short_description');
    const defaultPrompt = parseQuotedYamlField(agentsYaml, 'default_prompt');

    if (!displayName) {
      fail(`${skillName}/agents/openai.yaml is missing interface.display_name`);
    }

    if (!shortDescription) {
      fail(`${skillName}/agents/openai.yaml is missing interface.short_description`);
    } else if (shortDescription.length > 64) {
      fail(`${skillName}/agents/openai.yaml short_description must be 64 characters or fewer`);
    }

    if (!defaultPrompt) {
      fail(`${skillName}/agents/openai.yaml is missing interface.default_prompt`);
    } else if (!defaultPrompt.includes(`$${skillName}`)) {
      fail(`${skillName}/agents/openai.yaml default_prompt must mention $${skillName}`);
    }
  }
};

const assertSkillTriggerPhrases = (fail) => {
  const skillsRoot = path.join(PLUGIN_ROOT, 'skills');
  const skillDirectories = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const skillName of skillDirectories) {
    const skillPath = path.join(skillsRoot, skillName, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      continue;
    }

    const contents = readText(skillPath);

    if (!/^#+\s+When To Use\s*$/m.test(contents)) {
      fail(`${skillName}/SKILL.md must include a "When To Use" section with representative trigger phrases`);
    }
  }
};

const assertNoLegacySkillReferences = (fail) => {
  const filesToCheck = listFiles(PLUGIN_ROOT).filter((filePath) => {
    const extension = path.extname(filePath);

    return ['.md', '.yaml', '.yml'].includes(extension);
  });

  for (const filePath of filesToCheck) {
    const relativePath = path.relative(PLUGIN_ROOT, filePath);
    const contents = readText(filePath);

    for (const legacySkillName of LEGACY_SKILL_NAMES) {
      if (contents.includes(`name: ${legacySkillName}`)) {
        fail(`${relativePath} must not declare legacy skill name ${legacySkillName}`);
      }

      const mentionPattern =
        legacySkillName === 'setup-mcp'
          ? /(^|[^A-Za-z0-9_-])setup-mcp(?!\.sh)(?=$|[^A-Za-z0-9_-])/
          : new RegExp(
              `(^|[^A-Za-z0-9_-])${legacySkillName}(?=$|[^A-Za-z0-9_-])`,
            );

      if (mentionPattern.test(contents)) {
        fail(`${relativePath} must not mention legacy skill name ${legacySkillName}`);
      }
    }
  }
};

module.exports = {
  EXPECTED_CANONICAL_SKILLS,
  assertSkills,
  assertSkillTriggerPhrases,
  assertNoLegacySkillReferences,
};
