import { computeSriIntegrity } from 'src/engine/core-modules/application/application-registration-version/utils/compute-sri-integrity.util';

describe('computeSriIntegrity', () => {
  it('hashes bytes as sha512 SRI', () => {
    expect(computeSriIntegrity({ source: Buffer.from('hello') })).toBe(
      'sha512-m3HSJL1i83hdltRq0+o9czGb+8KJDKra4t/3JRlnPKcjI8PZm6XBHXx6zG4UuMXaDEZjR1wuXDre9G9zvN7AQw==',
    );
  });
});
