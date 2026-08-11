import { defineFrontComponentSharedDependencies } from '@/sdk/define';

describe('defineFrontComponentSharedDependencies', () => {
  it('should return a successful validation result when valid', () => {
    const result = defineFrontComponentSharedDependencies({
      dependencies: ['react', 'react-dom/client'],
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject an empty dependency list', () => {
    const result = defineFrontComponentSharedDependencies({ dependencies: [] });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      'Shared dependencies must declare at least one dependency',
    ]);
  });

  it('should reject relative and absolute paths', () => {
    const result = defineFrontComponentSharedDependencies({
      dependencies: ['./local-module'],
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain(
      'must be a package specifier, not a relative or absolute path',
    );
  });

  it.each([
    'twenty-client-sdk',
    'twenty-client-sdk/core',
    'twenty-sdk',
    'twenty-sdk/define',
  ])('should reject the reserved dependency "%s"', (dependency) => {
    const result = defineFrontComponentSharedDependencies({
      dependencies: [dependency],
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain(
      'is already served separately and cannot be shared',
    );
  });

  it('should reject a duplicated dependency', () => {
    const result = defineFrontComponentSharedDependencies({
      dependencies: ['react', 'react'],
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('is declared twice');
  });
});
