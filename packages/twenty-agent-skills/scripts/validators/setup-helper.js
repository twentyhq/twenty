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

  // spawnSync sets `error` (and leaves status/stdout/stderr null) when bash itself
  // cannot be launched — surface that instead of blaming the script's syntax.
  if (syntaxCheck.error) {
    fail(`could not run bash to validate setup-mcp.sh: ${syntaxCheck.error.message}`);
    return;
  }

  if (syntaxCheck.status !== 0) {
    fail(`setup-mcp.sh has invalid bash syntax: ${syntaxCheck.stderr.trim()}`);
  }

  for (const [input, expected] of URL_NORMALIZATION_CASES) {
    const result = spawnSync('bash', [setupScript, '--print-url', input], { encoding: 'utf8' });

    if (result.error) {
      fail(`could not run bash for setup-mcp.sh --print-url ${input}: ${result.error.message}`);
      continue;
    }

    if (result.status !== 0) {
      fail(`setup-mcp.sh --print-url ${input} failed: ${result.stderr.trim()}`);
      continue;
    }

    const actual = result.stdout.trim();

    if (actual !== expected) {
      fail(`setup-mcp.sh normalized ${input} to ${actual}, expected ${expected}`);
    }
  }
};

module.exports = { assertSetupHelper };
