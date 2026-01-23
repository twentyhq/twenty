import { defineApp } from '@/application';

describe('defineApp', () => {
  it('should return the config when valid', () => {
    const config = {
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      icon: 'IconWorld',
      functionRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
    };

    const result = defineApp(config);

    expect(result).toEqual(config);
  });

  it('should pass through all optional fields', () => {
    const config = {
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      icon: 'IconWorld',
      applicationVariables: {
        API_KEY: {
          universalIdentifier: '3a327392-3a0f-4605-9223-0633f063eaf6',
          description: 'API Key',
          isSecret: true,
        },
      },
      functionRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
    };

    const result = defineApp(config);

    expect(result).toEqual(config);
    expect(result.applicationVariables).toBeDefined();
    expect(result.functionRoleUniversalIdentifier).toBe(
      '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
    );
  });

  it('should throw error when universalIdentifier is missing', () => {
    const config = {
      displayName: 'My App',
    };

    expect(() => defineApp(config as any)).toThrow(
      'App must have a universalIdentifier',
    );
  });

  it('should throw error when universalIdentifier is empty string', () => {
    const config = {
      universalIdentifier: '',
      displayName: 'My App',
    };

    expect(() => defineApp(config as any)).toThrow(
      'App must have a universalIdentifier',
    );
  });
});
