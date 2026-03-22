import { vi } from 'vitest';

import { appBuild } from '@/cli/operations/build';
import { appUninstall } from '@/cli/operations/uninstall';
import { functionExecute } from '@/cli/operations/execute';
import { FUNCTION_EXECUTE_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';

const ADD_NUMBERS_UNIVERSAL_IDENTIFIER = 'f9e5589c-e951-4d99-85db-0a305ab53502';

const APP_PATH = FUNCTION_EXECUTE_APP_PATH;

describe('functionExecute E2E', () => {
  beforeAll(async () => {
    const buildResult = await appBuild({ appPath: APP_PATH });

    if (!buildResult.success) {
      throw new Error(
        `appBuild failed: ${buildResult.error.code} – ${buildResult.error.message}`,
      );
    }

    await vi.waitFor(
      async () => {
        const result = await functionExecute({
          appPath: APP_PATH,
          functionName: 'add-numbers',
          payload: { a: 0, b: 0 },
        });

        expect(result.success).toBe(true);
      },
      { timeout: 30_000, interval: 1_000 },
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
