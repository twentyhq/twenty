import { join, resolve } from 'node:path';

import { typecheckApp } from '@/application-build';
import { JSON_FIELD_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { appDevOnce } from '@/cli/operations/dev-once';
import { functionExecute } from '@/cli/operations/execute';
import { appUninstall } from '@/cli/operations/uninstall';
import { copy, remove } from '@/cli/utilities/file/fs-utils';

const APP_PATH = JSON_FIELD_APP_PATH;
const APP_NODE_MODULES_PATH = join(APP_PATH, 'node_modules');
const CLIENT_SDK_PACKAGE_PATH = resolve(APP_PATH, '../../../twenty-client-sdk');
const INSTALLED_CLIENT_SDK_PATH = join(
  APP_NODE_MODULES_PATH,
  'twenty-client-sdk',
);

const CHECKLIST_ITEMS = [
  { label: 'Book the venue', isDone: true },
  { label: 'Send the invitations' },
];

const installClientSdkInApp = async () => {
  await copy(
    join(CLIENT_SDK_PACKAGE_PATH, 'package.json'),
    join(INSTALLED_CLIENT_SDK_PATH, 'package.json'),
  );
  await copy(
    join(CLIENT_SDK_PACKAGE_PATH, 'dist'),
    join(INSTALLED_CLIENT_SDK_PATH, 'dist'),
  );
};

describe('JSON field E2E', () => {
  beforeAll(async () => {
    await installClientSdkInApp();

    const devResult = await appDevOnce({ appPath: APP_PATH });

    if (!devResult.success) {
      throw new Error(
        `appDevOnce failed: ${devResult.error.code} – ${devResult.error.message}`,
      );
    }
  }, 120_000);

  afterAll(async () => {
    await appUninstall({ appPath: APP_PATH });
    await remove(APP_NODE_MODULES_PATH);
  }, 30_000);

  it('should typecheck an array written to a JSON field against the generated core client', async () => {
    const result = await typecheckApp({ appPath: APP_PATH });

    expect(result).toEqual({ success: true, data: null, diagnostics: [] });
  });

  it('should store an array in a JSON field and return it', async () => {
    const result = await functionExecute({
      appPath: APP_PATH,
      functionName: 'save-checklist',
      payload: { items: CHECKLIST_ITEMS },
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        functionName: 'save-checklist',
        status: 'SUCCESS',
        data: CHECKLIST_ITEMS,
      },
    });
  });
});
