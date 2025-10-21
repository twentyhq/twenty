import { generateRandomSubdomain } from 'src/engine/core-modules/domain/subdomain-manager/utils/generate-random-subdomain.util';

describe('generateRandomSubdomain', () => {
  it('should return a string in the format "prefix-color-suffix"', () => {
    const result = generateRandomSubdomain();

    expect(result).toMatch(/^[a-z]+-[a-z]+-[a-z]+$/);
  });

  it('should generate different results on consecutive calls', () => {
    const result1 = generateRandomSubdomain();
    const result2 = generateRandomSubdomain();

    expect(result1).not.toEqual(result2);
  });
});
