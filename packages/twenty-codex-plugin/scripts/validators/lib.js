const fs = require('node:fs');
const path = require('node:path');

const PLUGIN_ROOT = path.resolve(__dirname, '..', '..');
const REPO_ROOT = path.resolve(PLUGIN_ROOT, '..', '..');

const PUBLIC_DOCS_MCP_SERVER_NAME = 'twenty-docs';
const PUBLIC_DOCS_MCP_URL = 'https://docs.twenty.com/mcp';
const LEGACY_SKILL_NAMES = [
  'app-readme-and-visuals',
  'build-app-features',
  'create-an-app',
  'design-front-components',
  'retrieve-and-present-data',
  'setup-mcp',
];

const VALID_CAPABILITIES = new Set(['Interactive', 'Read', 'Write']);
const VALID_CATEGORIES = new Set([
  'Business & Operations',
  'Communication',
  'Creativity',
  'Data & Analytics',
  'Developer Tools',
  'Education & Research',
  'Finance',
  'Other',
  'Productivity',
  'Travel',
]);
const SHORT_DESCRIPTION_MAX = 64;
const MIN_LOGO_DIMENSION = 256;

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

const parseQuotedYamlField = (contents, fieldName) => {
  const match = contents.match(new RegExp(`^\\s+${fieldName}:\\s+"([^"]+)"\\s*$`, 'm'));

  return match?.[1];
};

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
    host === 'app.twenty.com' ||
    host === 'twenty.com' ||
    host === 'docs.twenty.com' ||
    host === 'www.docker.com' ||
    host === 'github.com' ||
    host === 'www.w3.org' ||
    host === 'developers.openai.com' ||
    host === 'keepachangelog.com' ||
    host === 'semver.org' ||
    host.endsWith('.example')
  );
};

const readPngDimensions = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) {
    return undefined;
  }

  if (buffer.subarray(12, 16).toString('ascii') !== 'IHDR') {
    return undefined;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
};

const createJsonReaders = (fail) => {
  const readJson = (relativePath) => {
    const absolutePath = path.join(REPO_ROOT, relativePath);

    try {
      return JSON.parse(readText(absolutePath));
    } catch (error) {
      fail(`${relativePath} is not valid JSON: ${error.message}`);
      return undefined;
    }
  };

  const readOptionalJson = (relativePath) => {
    const absolutePath = path.join(REPO_ROOT, relativePath);

    if (!fs.existsSync(absolutePath)) {
      return undefined;
    }

    return readJson(relativePath);
  };

  return { readJson, readOptionalJson };
};

const createInterfacePathResolver = (fail) => (relativePath) => {
  if (typeof relativePath !== 'string' || relativePath.length === 0) {
    return undefined;
  }

  if (!relativePath.startsWith('./')) {
    fail(`interface path must start with ./ (got: ${relativePath})`);
    return undefined;
  }

  const resolvedPath = path.resolve(PLUGIN_ROOT, relativePath.slice(2));

  // Reject ../ traversal that escapes the plugin directory after normalization
  if (resolvedPath !== PLUGIN_ROOT && !resolvedPath.startsWith(PLUGIN_ROOT + path.sep)) {
    fail(`interface path must stay within the plugin directory (got: ${relativePath})`);
    return undefined;
  }

  return resolvedPath;
};

module.exports = {
  PLUGIN_ROOT,
  REPO_ROOT,
  PUBLIC_DOCS_MCP_SERVER_NAME,
  PUBLIC_DOCS_MCP_URL,
  LEGACY_SKILL_NAMES,
  VALID_CAPABILITIES,
  VALID_CATEGORIES,
  SHORT_DESCRIPTION_MAX,
  MIN_LOGO_DIMENSION,
  readText,
  listFiles,
  parseSkillFrontmatter,
  parseQuotedYamlField,
  isAllowedDocumentationHost,
  readPngDimensions,
  createJsonReaders,
  createInterfacePathResolver,
};
