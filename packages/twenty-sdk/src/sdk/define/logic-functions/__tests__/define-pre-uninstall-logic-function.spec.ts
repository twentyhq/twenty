import { definePreUninstallLogicFunction } from '@/sdk/define/logic-functions/define-pre-uninstall-logic-function';
import { type UninstallPayload } from '@/sdk/define/logic-functions/uninstall-payload-type';

const mockHandler = async (payload: UninstallPayload) => ({
  success: true,
  version: payload.version,
});

describe('definePreUninstallLogicFunction', () => {
  const validConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'Guard Uninstall',
    handler: mockHandler,
  };

  it('should return the config when valid', () => {
    const result = definePreUninstallLogicFunction(validConfig);

    expect(result.config).toEqual(validConfig);
  });

  it('should pass through optional fields', () => {
    const config = {
      ...validConfig,
      description: 'Blocks uninstall while a recording is in progress',
      timeoutSeconds: 30,
    };

    const result = definePreUninstallLogicFunction(config as any);

    expect(result.config.description).toBe(
      'Blocks uninstall while a recording is in progress',
    );
    expect(result.config.timeoutSeconds).toBe(30);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      name: 'Guard Uninstall',
      handler: mockHandler,
    };
    const result = definePreUninstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Pre uninstall logic function must have a universalIdentifier',
    );
  });

  it('should return error when handler is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Guard Uninstall',
    };

    const result = definePreUninstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Pre uninstall logic function must have a handler',
    );
  });

  it('should return error when handler is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Guard Uninstall',
      handler: 'not-a-function',
    };

    const result = definePreUninstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Pre uninstall logic function handler must be a function',
    );
  });
});
