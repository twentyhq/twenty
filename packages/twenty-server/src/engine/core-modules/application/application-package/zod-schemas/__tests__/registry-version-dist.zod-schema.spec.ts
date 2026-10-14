import { registryVersionDistSchema } from 'src/engine/core-modules/application/application-package/zod-schemas/registry-version-dist.zod-schema';

describe('registryVersionDistSchema', () => {
  const tarball = 'https://registry.npmjs.org/app/-/app-1.0.0.tgz';

  it('accepts a dist with a tarball and an integrity', () => {
    expect(
      registryVersionDistSchema.parse({ tarball, integrity: 'sha512-AAA=' }),
    ).toEqual({ tarball, integrity: 'sha512-AAA=' });
  });

  it('accepts a dist without integrity', () => {
    expect(registryVersionDistSchema.parse({ tarball })).toEqual({ tarball });
  });

  it('accepts a dist whose registry emits a null integrity', () => {
    expect(
      registryVersionDistSchema.parse({ tarball, integrity: null }),
    ).toEqual({ tarball, integrity: null });
  });

  it('rejects an integrity that is not a string', () => {
    expect(
      registryVersionDistSchema.safeParse({ tarball, integrity: 42 }).success,
    ).toBe(false);
  });
});
