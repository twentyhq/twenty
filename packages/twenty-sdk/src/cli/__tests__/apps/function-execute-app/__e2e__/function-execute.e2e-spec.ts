import { resolve } from 'path';

import { appBuild } from '@/cli/public-operations/app-build';
import { appUninstall } from '@/cli/public-operations/app-uninstall';
import { functionExecute } from '@/cli/public-operations/function-execute';

const APP_PATH = resolve(__dirname, '../');

describe('functionExecute E2E', () => {
  beforeAll(async () => {
    const buildResult = await appBuild({ appPath: APP_PATH });

    if (!buildResult.success) {
      throw new Error(
        `appBuild failed: ${buildResult.error.code} – ${buildResult.error.message}`,
      );
    }
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

    if (!result.success) {
      throw new Error(
        `functionExecute failed: ${result.error.code} – ${result.error.message} ${JSON.stringify(result.error.details ?? {})}`,
      );
    }

    expect(result.data.functionName).toBe('add-numbers');
    expect(result.data.status).toBe('SUCCESS');
    expect(result.data.data).toBe(10);
    expect(result.data.logs).toContain('Adding 3 + 7 = 10');
  });

  it('should execute a function by universalIdentifier', async () => {
    const result = await functionExecute({
      appPath: APP_PATH,
      functionUniversalIdentifier: 'a1b2c3d4-e5f6-4000-8000-000000000010',
      payload: { a: 100, b: 200 },
    });

    if (!result.success) {
      throw new Error(
        `functionExecute failed: ${result.error.code} – ${result.error.message} ${JSON.stringify(result.error.details ?? {})}`,
      );
    }

    expect(result.data.functionName).toBe('add-numbers');
    expect(result.data.status).toBe('SUCCESS');
    expect(result.data.data).toBe(300);
    expect(result.data.logs).toContain('Adding 100 + 200 = 300');
  });

  it('should return FUNCTION_NOT_FOUND for a non-existent function name', async () => {
    const result = await functionExecute({
      appPath: APP_PATH,
      functionName: 'non-existent-function',
    });

    expect(result.success).toBe(false);

    if (result.success) {
      return;
    }

    expect(result.error.code).toBe('FUNCTION_NOT_FOUND');
    expect(result.error.message).toContain('non-existent-function');
  });
});
