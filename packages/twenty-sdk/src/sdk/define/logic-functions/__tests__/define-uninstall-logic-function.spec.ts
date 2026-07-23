import { defineUninstallLogicFunction } from '@/sdk/define/logic-functions/define-uninstall-logic-function';
import { type UninstallPayload } from '@/sdk/define/logic-functions/uninstall-payload-type';

const mockHandler = async (payload: UninstallPayload) => ({
  success: true,
  version: payload.version,
});

describe('defineUninstallLogicFunction', () => {
  const validConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'Cleanup External Resources',
    handler: mockHandler,
  };

  it('should return the config when valid', () => {
    const result = defineUninstallLogicFunction(validConfig);

    expect(result.config).toEqual(validConfig);
  });

  it('should pass through optional fields', () => {
    const config = {
      ...validConfig,
      description: 'Deletes remaining bots on uninstall',
      timeoutSeconds: 30,
    };

    const result = defineUninstallLogicFunction(config as any);

    expect(result.config.description).toBe(
      'Deletes remaining bots on uninstall',
    );
    expect(result.config.timeoutSeconds).toBe(30);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      name: 'Cleanup External Resources',
      handler: mockHandler,
    };
    const result = defineUninstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Uninstall logic function must have a universalIdentifier',
    );
  });

  it('should return error when handler is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Cleanup External Resources',
    };

    const result = defineUninstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Uninstall logic function must have a handler',
    );
  });

  it('should return error when handler is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Cleanup External Resources',
      handler: 'not-a-function',
    };

    const result = defineUninstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Uninstall logic function handler must be a function',
    );
  });
});
