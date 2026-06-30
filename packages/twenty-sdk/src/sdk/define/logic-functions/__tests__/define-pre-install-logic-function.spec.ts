import { definePreInstallLogicFunction } from '@/sdk/define/logic-functions/define-pre-install-logic-function';
import { type InstallPayload } from '@/sdk/define/logic-functions/install-payload-type';

const mockHandler = async (payload: InstallPayload) => ({
  success: true,
  previousVersion: payload.previousVersion,
});

describe('definePreInstallLogicFunction', () => {
  const validRouteConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'Prepare Install',
    handler: mockHandler,
  };

  it('should return the config when valid', () => {
    const result = definePreInstallLogicFunction(validRouteConfig);

    expect(result.config).toEqual(validRouteConfig);
  });

  it('should pass through optional fields', () => {
    const config = {
      ...validRouteConfig,
      description: 'Prepare state before install',
      timeoutSeconds: 30,
      shouldRunOnVersionUpgrade: true,
    };

    const result = definePreInstallLogicFunction(config as any);

    expect(result.config.description).toBe('Prepare state before install');
    expect(result.config.timeoutSeconds).toBe(30);
    expect(result.config.shouldRunOnVersionUpgrade).toBe(true);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      name: 'Prepare Install',
      handler: mockHandler,
    };
    const result = definePreInstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Pre install logic function must have a universalIdentifier',
    );
  });

  it('should return error when handler is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Prepare Install',
    };

    const result = definePreInstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Pre install logic function must have a handler',
    );
  });

  it('should return error when handler is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Prepare Install',
      handler: 'not-a-function',
    };

    const result = definePreInstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Pre install logic function handler must be a function',
    );
  });
});
