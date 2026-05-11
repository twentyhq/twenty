#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const pluginRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(pluginRoot, '..', '..');

const failures = [];
const PUBLIC_DOCS_MCP_SERVER_NAME = 'twenty-docs';
const PUBLIC_DOCS_MCP_URL = 'https://docs.twenty.com/mcp';

const fail = (message) => {
  failures.push(message);
};

const readText = (filePath) => fs.readFileSync(filePath, 'utf8');

const isAllowedDocumentationHost = (hostname) => {
  const host = hostname.toLowerCase();

  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.startsWith('127.') ||
    host === '[::1]' ||
    host === 'example.com' ||
    host.endsWith('.example.com') ||
    host === 'example.twenty.com' ||
    host === 'myworkspace.twenty.com' ||
    host === 'myworkspace.customdomain.com' ||
    host === 'your-twenty-server.com' ||
    host === 'twenty.com' ||
    host === 'docs.twenty.com' ||
    host === 'docs.claude.com' ||
    host === 'github.com' ||
    host === 'www.w3.org' ||
    host.endsWith('.example')
  );
};

const readJson = (relativePath) => {
  const absolutePath = path.join(repoRoot, relativePath);

  try {
    return JSON.parse(readText(absolutePath));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return undefined;
  }
};

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

  return files;
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

const parseCommandFrontmatter = (commandPath) => {
  const contents = readText(commandPath);
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

const assertJsonMetadata = () => {
  const packageJson = readJson('packages/twenty-claude-code-plugin/package.json');
  const pluginJson = readJson(
    'packages/twenty-claude-code-plugin/.claude-plugin/plugin.json',
  );
  const mcpJson = readJson('packages/twenty-claude-code-plugin/.mcp.json');

  if (!packageJson?.files?.includes('.mcp.json')) {
    fail('package.json files must include .mcp.json for the public docs MCP server');
  }

  if (!packageJson?.files?.includes('.claude-plugin')) {
    fail('package.json files must include .claude-plugin');
  }

  if (!packageJson?.files?.includes('skills')) {
    fail('package.json files must include skills');
  }

  if (!packageJson?.files?.includes('commands')) {
    fail('package.json files must include commands');
  }

  if (pluginJson?.mcpServers !== './.mcp.json') {
    fail('.claude-plugin/plugin.json must declare mcpServers as ./.mcp.json');
  }

  if (!pluginJson?.name) {
    fail('.claude-plugin/plugin.json must declare a name');
  }

  if (!pluginJson?.version) {
    fail('.claude-plugin/plugin.json must declare a version');
  }

  const servers = mcpJson?.mcpServers;

  if (!servers || typeof servers !== 'object' || Array.isArray(servers)) {
    fail('.mcp.json must declare an mcpServers object');
  } else {
    const serverNames = Object.keys(servers);

    if (
      serverNames.length !== 1 ||
      serverNames[0] !== PUBLIC_DOCS_MCP_SERVER_NAME
    ) {
      fail(`.mcp.json must only declare ${PUBLIC_DOCS_MCP_SERVER_NAME}`);
    }

    const docsServer = servers[PUBLIC_DOCS_MCP_SERVER_NAME];

    if (!docsServer || typeof docsServer !== 'object' || Array.isArray(docsServer)) {
      fail(`${PUBLIC_DOCS_MCP_SERVER_NAME} must be an object`);
    } else {
      const docsServerKeys = Object.keys(docsServer);

      if (docsServerKeys.length !== 1 || docsServerKeys[0] !== 'url') {
        fail(`${PUBLIC_DOCS_MCP_SERVER_NAME} must only declare a url`);
      }

      if (docsServer.url !== PUBLIC_DOCS_MCP_URL) {
        fail(`${PUBLIC_DOCS_MCP_SERVER_NAME} url must be ${PUBLIC_DOCS_MCP_URL}`);
      }
    }
  }
};

const assertNoBundledMcpConfig = () => {
  const gitignorePath = path.join(pluginRoot, '.gitignore');

  if (
    fs.existsSync(gitignorePath) &&
    readText(gitignorePath).split(/\r?\n/).includes('.mcp.json')
  ) {
    fail('packages/twenty-claude-code-plugin/.gitignore must not ignore the public .mcp.json');
  }

  for (const filePath of listFiles(pluginRoot)) {
    const relativePath = path.relative(pluginRoot, filePath);

    if (path.basename(filePath) === '.mcp.json' && relativePath !== '.mcp.json') {
      fail(`workspace-specific MCP config must not be shipped: ${relativePath}`);
    }

    if (relativePath.endsWith('.png') || relativePath.endsWith('.jpg') || relativePath.endsWith('.svg')) {
      continue;
    }

    let contents;

    try {
      contents = readText(filePath);
    } catch {
      continue;
    }

    const urls = contents.matchAll(/https?:\/\/[^\s"`'<>)]*/g);

    for (const [rawUrl] of urls) {
      let parsedUrl;

      if (/[${}*]/.test(rawUrl)) {
        continue;
      }

      try {
        parsedUrl = new URL(rawUrl);
      } catch {
        continue;
      }

      if (!isAllowedDocumentationHost(parsedUrl.hostname)) {
        fail(`non-placeholder URL found in ${relativePath}: ${parsedUrl.origin}`);
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

const assertSkills = () => {
  const skillsRoot = path.join(pluginRoot, 'skills');

  if (!fs.existsSync(skillsRoot)) {
    fail('skills/ directory is missing');
    return;
  }

  const skillDirectories = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const skillName of skillDirectories) {
    const skillPath = path.join(skillsRoot, skillName, 'SKILL.md');

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

      const allowedKeys = ['description', 'name', 'allowed-tools'];

      if (frontmatterKeys.some((key) => !allowedKeys.includes(key))) {
        fail(
          `${skillName}/SKILL.md frontmatter should only include name, description, and optional allowed-tools`,
        );
      }
    }
  }
};

const assertCommands = () => {
  const commandsRoot = path.join(pluginRoot, 'commands');

  if (!fs.existsSync(commandsRoot)) {
    return;
  }

  const commandFiles = fs
    .readdirSync(commandsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort();

  if (commandFiles.length === 0) {
    fail('commands/ directory exists but contains no .md slash commands');
    return;
  }

  for (const fileName of commandFiles) {
    const commandPath = path.join(commandsRoot, fileName);
    const frontmatter = parseCommandFrontmatter(commandPath);

    if (!frontmatter) {
      fail(`commands/${fileName} is missing YAML frontmatter`);
      continue;
    }

    if (!frontmatter.description) {
      fail(`commands/${fileName} frontmatter must include a description`);
    }
  }
};

const assertSetupHelper = () => {
  const setupScript = path.join(pluginRoot, 'scripts', 'setup-mcp.sh');
  const syntaxCheck = spawnSync('bash', ['-n', setupScript], { encoding: 'utf8' });

  if (syntaxCheck.status !== 0) {
    fail(`setup-mcp.sh has invalid bash syntax: ${syntaxCheck.stderr.trim()}`);
  }

  const cases = [
    ['myworkspace.localhost:3001', 'http://myworkspace.localhost:3001/mcp'],
    ['crm.example.com', 'https://crm.example.com/mcp'],
    ['https://crm.example.com/mcp', 'https://crm.example.com/mcp'],
  ];

  for (const [input, expected] of cases) {
    const result = spawnSync('bash', [setupScript, '--print-url', input], {
      encoding: 'utf8',
    });
    const actual = result.stdout.trim();

    if (result.status !== 0) {
      fail(`setup-mcp.sh --print-url ${input} failed: ${result.stderr.trim()}`);
    } else if (actual !== expected) {
      fail(`setup-mcp.sh normalized ${input} to ${actual}, expected ${expected}`);
    }
  }
};

const assertMarketplace = () => {
  const marketplacePath = path.join(repoRoot, '.claude-plugin', 'marketplace.json');

  if (!fs.existsSync(marketplacePath)) {
    fail('.claude-plugin/marketplace.json must exist at the repo root for local testing');
    return;
  }

  let marketplace;

  try {
    marketplace = JSON.parse(readText(marketplacePath));
  } catch (error) {
    fail(`.claude-plugin/marketplace.json is not valid JSON: ${error.message}`);
    return;
  }

  const entry = marketplace?.plugins?.find((plugin) => plugin.name === 'twenty');

  if (!entry) {
    fail('.claude-plugin/marketplace.json must include the twenty plugin entry');
  } else if (entry.source !== './packages/twenty-claude-code-plugin') {
    fail('.claude-plugin/marketplace.json twenty source must be ./packages/twenty-claude-code-plugin');
  }
};

assertJsonMetadata();
assertNoBundledMcpConfig();
assertSkills();
assertCommands();
assertSetupHelper();
assertMarketplace();

if (failures.length > 0) {
  console.error('Twenty Claude Code plugin validation failed:');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exit(1);
}

console.log('Twenty Claude Code plugin validation passed.');
