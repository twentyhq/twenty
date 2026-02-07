import { defineLogicFunction } from '@/sdk';

const mockHandler = async () => ({ success: true });

describe('defineLogicFunction', () => {
  const validRouteConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'Send Postcard',
    handler: mockHandler,
    httpRouteTriggerSettings: {
      universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
      type: 'route',
      path: '/postcards/send',
      httpMethod: 'POST',
      isAuthRequired: true,
    },
  };

  it('should return the config when valid with route trigger', () => {
    const result = defineLogicFunction(validRouteConfig as any);

    expect(result.config).toEqual(validRouteConfig);
  });

  it('should accept cronTriggerSettings', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Daily Report',
      handler: mockHandler,
      cronTriggerSettings: {
        pattern: '0 9 * * *',
      },
    };

    const result = defineLogicFunction(config as any);

    expect(result.config.cronTriggerSettings.pattern).toBeDefined();
  });

  it('should accept databaseEventTriggerSettings', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'On Contact Created',
      handler: mockHandler,
      databaseEventTriggerSettings: {
        eventName: 'contact.created',
      },
    };

    const result = defineLogicFunction(config as any);

    expect(result.config.databaseEventTriggerSettings.eventName).toBeDefined();
  });

  it('should pass through optional fields', () => {
    const config = {
      ...validRouteConfig,
      description: 'Send a postcard to a contact',
      timeoutSeconds: 30,
    };

    const result = defineLogicFunction(config as any);

    expect(result.config.description).toBe('Send a postcard to a contact');
    expect(result.config.timeoutSeconds).toBe(30);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      name: 'Send Postcard',
      handler: mockHandler,
      httpRouteTriggerSettings: validRouteConfig.httpRouteTriggerSettings,
    };
    const result = defineLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Logic function must have a universalIdentifier',
    );
  });

  it('should return error when handler is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      httpRouteTriggerSettings: validRouteConfig.httpRouteTriggerSettings,
    };

    const result = defineLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Logic function must have a handler');
  });

  it('should return error when handler is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: 'not-a-function',
      httpRouteTriggerSettings: validRouteConfig.httpRouteTriggerSettings,
    };

    const result = defineLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Logic function handler must be a function',
    );
  });

  it('should accept empty undefined', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
      httpRouteTriggerSettings: undefined,
    };

    const result = defineLogicFunction(config as any);

    expect(result.config.httpRouteTriggerSettings).toBeUndefined();
  });

  it('should accept missing trigger', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
    };

    const result = defineLogicFunction(config as any);

    expect(result.config.httpRouteTriggerSettings).toBeUndefined();
  });

  it('should return error when route trigger is missing path', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
      httpRouteTriggerSettings: {
        type: 'route',
        httpMethod: 'POST',
        isAuthRequired: true,
      },
    };

    const result = defineLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Route trigger must have a path');
  });

  it('should return error when route trigger is missing httpMethod', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
      httpRouteTriggerSettings: {
        type: 'route',
        path: '/postcards/send',
        isAuthRequired: true,
      },
    };

    const result = defineLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Route trigger must have an httpMethod');
  });

  it('should return error when cron trigger is missing pattern', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Daily Report',
      handler: mockHandler,
      cronTriggerSettings: {},
    };

    const result = defineLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Cron trigger must have a pattern');
  });

  it('should return error when databaseEvent trigger is missing eventName', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'On Contact Created',
      handler: mockHandler,
      databaseEventTriggerSettings: {},
    };

    const result = defineLogicFunction(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Database event trigger must have an eventName',
    );
  });
});
