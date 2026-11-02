const { execFile } = require('child_process');
const { cp } = require('fs/promises');
const { join } = require('path');
const { promisify } = require('util');

const execFilePromise = promisify(execFile);
const YARN_ENGINE_RELATIVE_PATH = '.yarn/releases/yarn-4.9.2.cjs';

const installYarnDependencies = async ({
  directory,
  yarnEngineDirectory,
  args,
  env = {},
  timeout,
}) => {
  await cp(yarnEngineDirectory, directory, { recursive: true });

  // A parent tsx loader must not be inherited by Yarn.
  const { NODE_OPTIONS: _nodeOptions, ...environment } = {
    ...process.env,
    ...env,
  };

  return execFilePromise(
    process.execPath,
    [join(directory, YARN_ENGINE_RELATIVE_PATH), ...args],
    { cwd: directory, env: environment, timeout },
  );
};

module.exports = { installYarnDependencies };
