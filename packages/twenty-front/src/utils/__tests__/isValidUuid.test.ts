import { isValidUuid } from '~/utils/isValidUuid';

describe('isValidUuid', () => {
  it('returns true if value is a valid UUID', () => {
    expect(isValidUuid('bec09e27-4ecc-4a85-afc1-f2c0ace28bfa')).toBe(true);
  });

  it('returns false if value is not a valid UUID', () => {
    expect(isValidUuid('123e4567-e89b-12d3-a456-42661417400')).toBe(false);
  });
});
