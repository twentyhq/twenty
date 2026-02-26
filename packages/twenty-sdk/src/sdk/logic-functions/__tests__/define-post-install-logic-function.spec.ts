import { definePostInstallLogicFunction } from '@/sdk/logic-functions/define-post-install-logic-function';
import { type InstallLogicFunctionPayload } from '@/sdk/logic-functions/install-logic-function-payload-type';

const mockHandler = async (payload: InstallLogicFunctionPayload) => ({
  success: true,
  previousVersion: payload.previousVersion,
});

describe('definePostInstallLogicFunction', () => {
  const validRouteConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'Send Postcard',
    handler: mockHandler,
  };

  it('should return the config when valid with route trigger', () => {
    const result = definePostInstallLogicFunction(validRouteConfig);

    expect(result.config).toEqual(validRouteConfig);
  });

  it('should pass through optional fields', () => {
    const config = {
      ...validRouteConfig,
      description: 'Send a postcard to a contact',
      timeoutSeconds: 30,
    };

    const result = definePostInstallLogicFunction(config as any);

    expect(result.config.description).toBe('Send a postcard to a contact');
    expect(result.config.timeoutSeconds).toBe(30);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      name: 'Send Postcard',
      handler: mockHandler,
    };
    const result = definePostInstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Post install logic function must have a universalIdentifier',
    );
  });

  it('should return error when handler is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
    };

    const result = definePostInstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Post install logic function must have a handler',
    );
  });

  it('should return error when handler is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: 'not-a-function',
    };

    const result = definePostInstallLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Post install logic function handler must be a function',
    );
  });
});
