import { defineSettingsBanner } from '@/sdk/define';

const MockComponent = () => null;

describe('defineSettingsBanner', () => {
  const validConfig = {
    universalIdentifier: '8ff5b3b6-3a0f-4c2f-9d3a-1e0f5b7d2c41',
    name: 'App Settings Banner',
    component: MockComponent,
  };

  it('should return successful validation result when valid', () => {
    const result = defineSettingsBanner(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should return error when universalIdentifier is missing', () => {
    const result = defineSettingsBanner({
      name: 'App Settings Banner',
      component: MockComponent,
    } as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings banner must have a universalIdentifier',
    );
  });

  it('should return error when component is missing', () => {
    const result = defineSettingsBanner({
      universalIdentifier: '8ff5b3b6-3a0f-4c2f-9d3a-1e0f5b7d2c41',
      name: 'App Settings Banner',
    } as any);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(['Settings banner must have a component']);
  });

  it('should return error when component is not a function', () => {
    const result = defineSettingsBanner({
      universalIdentifier: '8ff5b3b6-3a0f-4c2f-9d3a-1e0f5b7d2c41',
      name: 'App Settings Banner',
      component: 'not-a-function',
    } as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings banner component must be a React component',
    );
  });
});
