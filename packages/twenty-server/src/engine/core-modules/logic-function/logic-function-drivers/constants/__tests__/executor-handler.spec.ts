import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { PREBUILT_BUNDLE_FILE_NAME } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';

// This spec lives outside executor/ because that folder is copied whole into the Lambda zip.
const EXECUTOR_HANDLER_PATH = join(__dirname, '..', 'executor', 'index.mjs');

const PREBUILT_BUNDLE = `
globalThis.bundleEvaluationCount = (globalThis.bundleEvaluationCount ?? 0) + 1;
globalThis.handlerCallCount = 0;

const variableReadAtModuleScope = process.env.MY_VARIABLE;

export const main = async (params) => {
  globalThis.handlerCallCount += 1;

  return { params, variableReadAtModuleScope };
};
`;

const SCENARIO = `
import { handler } from './index.mjs';

const warmUpResult = await handler({
  isWarmUp: true,
  env: { MY_VARIABLE: 'warm-up-value' },
});
const handlerCallCountAfterWarmUp = globalThis.handlerCallCount;
const isVariableSetAfterWarmUp = 'MY_VARIABLE' in process.env;

const executionResult = await handler({
  params: { recordId: 'record-id' },
  context: {},
  env: { MY_VARIABLE: 'execution-value' },
  handlerName: 'main',
});

console.log(
  JSON.stringify({
    warmUpResult,
    handlerCallCountAfterWarmUp,
    isVariableSetAfterWarmUp,
    executionResult,
    handlerCallCountAfterExecution: globalThis.handlerCallCount,
    bundleEvaluationCount: globalThis.bundleEvaluationCount,
    isVariableSetAfterExecution: 'MY_VARIABLE' in process.env,
  }),
);
`;

describe('executor handler', () => {
  let executorDirectory: string;

  beforeEach(async () => {
    executorDirectory = await fs.mkdtemp(join(tmpdir(), 'executor-handler-'));

    await fs.copyFile(
      EXECUTOR_HANDLER_PATH,
      join(executorDirectory, 'index.mjs'),
    );
    await fs.writeFile(
      join(executorDirectory, PREBUILT_BUNDLE_FILE_NAME),
      PREBUILT_BUNDLE,
    );
    await fs.writeFile(join(executorDirectory, 'scenario.mjs'), SCENARIO);
  });

  afterEach(async () => {
    await fs.rm(executorDirectory, { recursive: true, force: true });
  });

  it('loads the bundle on warm-up without running its handler, then reuses it', async () => {
    const { MY_VARIABLE: _unsetVariable, ...envWithoutVariable } = process.env;

    const { stdout } = await promisify(execFile)(
      process.execPath,
      ['scenario.mjs'],
      { cwd: executorDirectory, env: envWithoutVariable },
    );

    expect(JSON.parse(stdout)).toEqual({
      warmUpResult: null,
      handlerCallCountAfterWarmUp: 0,
      isVariableSetAfterWarmUp: false,
      executionResult: {
        params: { recordId: 'record-id' },
        variableReadAtModuleScope: 'warm-up-value',
      },
      handlerCallCountAfterExecution: 1,
      bundleEvaluationCount: 1,
      isVariableSetAfterExecution: false,
    });
  });
});
