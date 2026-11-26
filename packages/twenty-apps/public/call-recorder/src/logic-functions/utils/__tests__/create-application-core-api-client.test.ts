import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { createApplicationCoreApiClient } from 'src/logic-functions/utils/create-application-core-api-client.util';

const coreClientOptionsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    constructor(options: ConstructorParameters<typeof CoreApiClient>[0]) {
      coreClientOptionsMock(options);
    }
  },
}));

describe('createApplicationCoreApiClient', () => {
  it('builds a client that acts as the application', () => {
    createApplicationCoreApiClient();

    expect(coreClientOptionsMock).toHaveBeenCalledWith(
      expect.objectContaining({ runAs: 'application' }),
    );
  });
});
