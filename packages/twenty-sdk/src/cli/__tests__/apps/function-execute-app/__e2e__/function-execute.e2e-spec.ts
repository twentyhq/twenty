import { resolve } from 'path';
import { vi } from 'vitest';

import { appBuild } from '@/cli/public-operations/app-build';
import { appUninstall } from '@/cli/public-operations/app-uninstall';
import { functionExecute } from '@/cli/public-operations/function-execute';
import { ADD_NUMBERS_UNIVERSAL_IDENTIFIER } from '../src/logic-functions/add-numbers.function';

const APP_PATH = resolve(__dirname, '../');

describe('functionExecute E2E', () => {
  beforeAll(async () => {
    const buildResult = await appBuild({ appPath: APP_PATH });

    if (!buildResult.success) {
      throw new Error(
        `appBuild failed: ${buildResult.error.code} – ${buildResult.error.message}`,
      );
    }

    // Although appBuild uploads files before syncing the manifest, the server
    // may need a moment to make them readable by the execution engine.
    // Retry a dummy execution until the handler file becomes available.
    await vi.waitFor(
      async () => {
        const result = await functionExecute({
          appPath: APP_PATH,
          functionName: 'add-numbers',
          payload: { a: 0, b: 0 },
        });

        expect(result.success).toBe(true);
      },
      { timeout: 10_000, interval: 1_000 },
    );
  }, 60_000);

  afterAll(async () => {
    await appUninstall({ appPath: APP_PATH });
  }, 30_000);

  it('should execute a function by name and return the computed result', async () => {
    const result = await functionExecute({
      appPath: APP_PATH,
      functionName: 'add-numbers',
      payload: { a: 3, b: 7 },
    });

    expect(result).toMatchObject({
      success: true,
      data: { functionName: 'add-numbers', status: 'SUCCESS', data: 10 },
    });
  });

  it('should execute a function by universalIdentifier', async () => {
    const result = await functionExecute({
      appPath: APP_PATH,
      functionUniversalIdentifier: ADD_NUMBERS_UNIVERSAL_IDENTIFIER,
      payload: { a: 100, b: 200 },
    });

    expect(result).toMatchObject({
      success: true,
      data: { functionName: 'add-numbers', status: 'SUCCESS', data: 300 },
    });
  });

  it('should return FUNCTION_NOT_FOUND for a non-existent function name', async () => {
    const result = await functionExecute({
      appPath: APP_PATH,
      functionName: 'non-existent-function',
    });

    expect(result).toMatchObject({
      success: false,
      error: { code: 'FUNCTION_NOT_FOUND' },
    });
  });
});
