import { defineVendor } from '@/sdk/define';

describe('defineVendor', () => {
  it('should return a successful validation result when valid', () => {
    const result = defineVendor({
      dependencies: ['react', 'react-dom/client'],
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject an empty dependency list', () => {
    const result = defineVendor({ dependencies: [] });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(['Vendor must have at least one dependency']);
  });

  it('should reject relative and absolute paths', () => {
    const result = defineVendor({ dependencies: ['./local-module'] });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain(
      'must be a package specifier, not a relative or absolute path',
    );
  });

  it.each(['twenty-client-sdk', 'twenty-client-sdk/core', 'twenty-sdk', 'twenty-sdk/define'])(
    'should reject the reserved dependency "%s"',
    (dependency) => {
      const result = defineVendor({ dependencies: [dependency] });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain(
        'is already served separately and cannot be vendored',
      );
    },
  );

  it('should reject a duplicated dependency', () => {
    const result = defineVendor({ dependencies: ['react', 'react'] });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('is declared twice');
  });
});
