import { defineFrontComponent } from '@/application';

// Mock component for testing
const MockComponent = () => null;

describe('defineFrontComponent', () => {
  const validConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'My Component',
    component: MockComponent,
  };

  it('should return the config when valid', () => {
    const result = defineFrontComponent(validConfig);

    expect(result).toEqual(validConfig);
  });

  it('should pass through optional fields', () => {
    const config = {
      ...validConfig,
      description: 'A sample front component',
    };

    const result = defineFrontComponent(config);

    expect(result.description).toBe('A sample front component');
  });

  it('should throw error when universalIdentifier is missing', () => {
    const config = {
      name: 'My Component',
      component: MockComponent,
    };

    expect(() => defineFrontComponent(config as any)).toThrow(
      'FrontComponent must have a universalIdentifier',
    );
  });

  it('should throw error when component is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'My Component',
    };

    expect(() => defineFrontComponent(config as any)).toThrow(
      'FrontComponent must have a component',
    );
  });

  it('should throw error when component is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'My Component',
      component: 'not-a-function',
    };

    expect(() => defineFrontComponent(config as any)).toThrow(
      'FrontComponent must have a component',
    );
  });

  it('should accept config without name', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      component: MockComponent,
    };

    const result = defineFrontComponent(config as any);

    expect(result.name).toBeUndefined();
  });
});
