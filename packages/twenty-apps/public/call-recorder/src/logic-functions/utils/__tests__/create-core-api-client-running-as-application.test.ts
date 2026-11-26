import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { createCoreApiClientRunningAsApplication } from 'src/logic-functions/utils/create-core-api-client-running-as-application.util';

const coreClientOptionsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    constructor(options: ConstructorParameters<typeof CoreApiClient>[0]) {
      coreClientOptionsMock(options);
    }
  },
}));

describe('createCoreApiClientRunningAsApplication', () => {
  it('builds a client that acts as the application', () => {
    createCoreApiClientRunningAsApplication();

    expect(coreClientOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({ runAs: 'application' }),
    );
  });
});
