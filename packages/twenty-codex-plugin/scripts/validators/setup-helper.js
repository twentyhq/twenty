const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { PLUGIN_ROOT } = require('./lib');

const URL_NORMALIZATION_CASES = [
  ['myworkspace.localhost:3001', 'http://myworkspace.localhost:3001/mcp'],
  ['crm.example.com', 'https://crm.example.com/mcp'],
  ['https://crm.example.com/mcp', 'https://crm.example.com/mcp'],
];

const assertSetupHelper = (fail) => {
  const setupScript = path.join(PLUGIN_ROOT, 'scripts', 'setup-mcp.sh');
  const syntaxCheck = spawnSync('bash', ['-n', setupScript], { encoding: 'utf8' });

  if (syntaxCheck.status !== 0) {
    fail(`setup-mcp.sh has invalid bash syntax: ${syntaxCheck.stderr.trim()}`);
  }

  for (const [input, expected] of URL_NORMALIZATION_CASES) {
    const result = spawnSync('bash', [setupScript, '--print-url', input], { encoding: 'utf8' });
    const actual = result.stdout.trim();

    if (result.status !== 0) {
      fail(`setup-mcp.sh --print-url ${input} failed: ${result.stderr.trim()}`);
    } else if (actual !== expected) {
      fail(`setup-mcp.sh normalized ${input} to ${actual}, expected ${expected}`);
    }
  }
};

module.exports = { assertSetupHelper };
