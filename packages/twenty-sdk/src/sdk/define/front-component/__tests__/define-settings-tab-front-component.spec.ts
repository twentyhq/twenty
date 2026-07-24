import { defineSettingsTabFrontComponent } from '@/sdk/define';

const MockComponent = () => null;

describe('defineSettingsTabFrontComponent', () => {
  const validConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'App Settings',
    component: MockComponent,
  };

  it('should return successful validation result when valid', () => {
    const result = defineSettingsTabFrontComponent(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      name: 'App Settings',
      component: MockComponent,
    };

    const result = defineSettingsTabFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings tab front component must have a universalIdentifier',
    );
  });

  it('should return error when component is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'App Settings',
    };

    const result = defineSettingsTabFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings tab front component must have a component',
    );
  });

  it('should return error when component is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'App Settings',
      component: 'not-a-function',
    };

    const result = defineSettingsTabFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings tab front component component must be a React component',
    );
  });
});
