import { defineSettingsFrontComponent } from '@/sdk/define';

const MockComponent = () => null;

describe('defineSettingsFrontComponent', () => {
  const validConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'App Settings',
    component: MockComponent,
  };

  it('should return successful validation result when valid', () => {
    const result = defineSettingsFrontComponent(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      name: 'App Settings',
      component: MockComponent,
    };

    const result = defineSettingsFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings front component must have a universalIdentifier',
    );
  });

  it('should return error when component is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'App Settings',
    };

    const result = defineSettingsFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      'Settings front component must have a component',
    ]);
  });

  it('should return error when component is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'App Settings',
      component: 'not-a-function',
    };

    const result = defineSettingsFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings front component component must be a React component',
    );
  });

  it('should accept a tab declaration', () => {
    const config = {
      ...validConfig,
      tab: { label: 'Billing', icon: 'IconCreditCard', position: 2 },
    };

    const result = defineSettingsFrontComponent(config);

    expect(result.success).toBe(true);
    expect(result.config.tab).toEqual({
      label: 'Billing',
      icon: 'IconCreditCard',
      position: 2,
    });
  });

  it('should return error when tab position is not an integer', () => {
    const result = defineSettingsFrontComponent({
      ...validConfig,
      tab: { position: 1.5 },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings front component tab position must be an integer',
    );
  });

  it('should return error when tab label is blank', () => {
    const result = defineSettingsFrontComponent({
      ...validConfig,
      tab: { label: '  ' },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings front component tab label must not be empty',
    );
  });

  it('should return error when tab label is the reserved General label', () => {
    const result = defineSettingsFrontComponent({
      ...validConfig,
      tab: { label: 'General' },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Settings front component tab label "General" is reserved',
    );
  });

  it('should reject the reserved label whatever its casing', () => {
    const result = defineSettingsFrontComponent({
      ...validConfig,
      tab: { label: '  general  ' },
    });

    expect(result.success).toBe(false);
  });

  it('should accept a label that merely contains the reserved word', () => {
    const result = defineSettingsFrontComponent({
      ...validConfig,
      tab: { label: 'General settings' },
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should accept a negative tab position', () => {
    const result = defineSettingsFrontComponent({
      ...validConfig,
      tab: { position: -1 },
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
