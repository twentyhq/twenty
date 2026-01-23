import { defineFunction } from '@/application';

// Mock handler for testing
const mockHandler = async () => ({ success: true });

describe('defineFunction', () => {
  const validRouteConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'Send Postcard',
    handler: mockHandler,
    triggers: [
      {
        universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
        type: 'route' as const,
        path: '/postcards/send',
        httpMethod: 'POST' as const,
        isAuthRequired: true,
      },
    ],
  };

  it('should return the config when valid with route trigger', () => {
    const result = defineFunction(validRouteConfig);

    expect(result).toEqual(validRouteConfig);
  });

  it('should accept cron trigger', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Daily Report',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: 'dd802808-0695-49e1-98c9-d5c9e2704ce2',
          type: 'cron' as const,
          pattern: '0 9 * * *',
        },
      ],
    };

    const result = defineFunction(config);

    expect(result.triggers[0].type).toBe('cron');
  });

  it('should accept databaseEvent trigger', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'On Contact Created',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: '203f1df3-4a82-4d06-a001-b8cf22a31156',
          type: 'databaseEvent' as const,
          eventName: 'contact.created',
        },
      ],
    };

    const result = defineFunction(config);

    expect(result.triggers[0].type).toBe('databaseEvent');
  });

  it('should accept multiple triggers', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Multi-trigger Function',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
          type: 'route' as const,
          path: '/sync',
          httpMethod: 'POST' as const,
          isAuthRequired: true,
        },
        {
          universalIdentifier: 'dd802808-0695-49e1-98c9-d5c9e2704ce2',
          type: 'cron' as const,
          pattern: '0 * * * *',
        },
      ],
    };

    const result = defineFunction(config);

    expect(result.triggers).toHaveLength(2);
  });

  it('should pass through optional fields', () => {
    const config = {
      ...validRouteConfig,
      description: 'Send a postcard to a contact',
      timeoutSeconds: 30,
    };

    const result = defineFunction(config);

    expect(result.description).toBe('Send a postcard to a contact');
    expect(result.timeoutSeconds).toBe(30);
  });

  it('should throw error when universalIdentifier is missing', () => {
    const config = {
      name: 'Send Postcard',
      handler: mockHandler,
      triggers: validRouteConfig.triggers,
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Function must have a universalIdentifier',
    );
  });

  it('should throw error when handler is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      triggers: validRouteConfig.triggers,
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Function must have a handler',
    );
  });

  it('should throw error when handler is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: 'not-a-function',
      triggers: validRouteConfig.triggers,
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Function must have a handler',
    );
  });

  it('should accept empty triggers array', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
      triggers: [],
    };

    const result = defineFunction(config as any);

    expect(result.triggers).toEqual([]);
  });

  it('should accept missing triggers', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
    };

    const result = defineFunction(config as any);

    expect(result.triggers).toBeUndefined();
  });

  it('should throw error when trigger is missing universalIdentifier', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
      triggers: [
        {
          type: 'route' as const,
          path: '/postcards/send',
          httpMethod: 'POST' as const,
          isAuthRequired: true,
        },
      ],
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Each trigger must have a universalIdentifier',
    );
  });

  it('should throw error when trigger is missing type', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
          path: '/postcards/send',
          httpMethod: 'POST' as const,
        },
      ],
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Each trigger must have a type',
    );
  });

  it('should throw error when route trigger is missing path', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
          type: 'route' as const,
          httpMethod: 'POST' as const,
          isAuthRequired: true,
        },
      ],
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Route trigger must have a path',
    );
  });

  it('should throw error when route trigger is missing httpMethod', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Send Postcard',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
          type: 'route' as const,
          path: '/postcards/send',
          isAuthRequired: true,
        },
      ],
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Route trigger must have an httpMethod',
    );
  });

  it('should throw error when cron trigger is missing pattern', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Daily Report',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: 'dd802808-0695-49e1-98c9-d5c9e2704ce2',
          type: 'cron' as const,
        },
      ],
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Cron trigger must have a pattern',
    );
  });

  it('should throw error when databaseEvent trigger is missing eventName', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'On Contact Created',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: '203f1df3-4a82-4d06-a001-b8cf22a31156',
          type: 'databaseEvent' as const,
        },
      ],
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Database event trigger must have an eventName',
    );
  });

  it('should throw error for unknown trigger type', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'Unknown Trigger',
      handler: mockHandler,
      triggers: [
        {
          universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
          type: 'unknown' as any,
        },
      ],
    };

    expect(() => defineFunction(config as any)).toThrow(
      'Unknown trigger type: unknown',
    );
  });
});
