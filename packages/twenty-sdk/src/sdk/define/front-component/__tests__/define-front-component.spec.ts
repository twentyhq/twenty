import { defineFrontComponent } from '@/sdk/define';
import { PageLayoutType } from 'twenty-shared/types';

const MockComponent = () => null;

describe('defineFrontComponent', () => {
  const validConfig = {
    universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    name: 'My Component',
    component: MockComponent,
  };

  it('should return successful validation result when valid', () => {
    const result = defineFrontComponent(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should pass through optional fields', () => {
    const config = {
      ...validConfig,
      description: 'A sample front component',
    };

    const result = defineFrontComponent(config);

    expect(result.success).toBe(true);
    expect(result.config?.description).toBe('A sample front component');
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      name: 'My Component',
      component: MockComponent,
    };

    const result = defineFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Front component must have a universalIdentifier',
    );
  });

  it('should return error when component is missing', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'My Component',
    };

    const result = defineFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Front component must have a component');
  });

  it('should return error when component is not a function', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      name: 'My Component',
      component: 'not-a-function',
    };

    const result = defineFrontComponent(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Front component component must be a React component',
    );
  });

  it('should accept config without name', () => {
    const config = {
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
      component: MockComponent,
    };

    const result = defineFrontComponent(config as any);

    expect(result.success).toBe(true);
    expect(result.config?.name).toBeUndefined();
  });

  it('should accept a widgetAvailability restricted to objects', () => {
    const result = defineFrontComponent({
      ...validConfig,
      widgetAvailability: {
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectUniversalIdentifiers: ['20202020-b374-4779-a561-80086cb2e17f'],
      },
    });

    expect(result.success).toBe(true);
  });

  it('should return error when widgetAvailability restricts record pages to no object', () => {
    const result = defineFrontComponent({
      ...validConfig,
      widgetAvailability: {
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        objectUniversalIdentifiers: [],
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      expect.stringContaining(
        'widgetAvailability.objectUniversalIdentifiers must not be empty',
      ),
    ]);
  });
});
