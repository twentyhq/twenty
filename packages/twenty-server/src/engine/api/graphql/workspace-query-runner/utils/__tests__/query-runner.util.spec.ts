import { lowercaseDomain } from 'src/engine/api/graphql/workspace-query-runner/utils/query-runner-links.util';

describe('queryRunner LINKS util', () => {
  it('should leave lowcased domain unchanged', () => {
    const primaryLinkUrl = 'https://www.example.com/test';
    const result = lowercaseDomain(primaryLinkUrl);

    expect(result).toBe('https://www.example.com/test');
  });

  it('should lowercase the domain of the primary link url', () => {
    const primaryLinkUrl = 'htTps://wwW.exAmple.coM/TEST';
    const result = lowercaseDomain(primaryLinkUrl);

    expect(result).toBe('https://www.example.com/TEST');
  });
});
