import { planCompanyDomainNameNormalization } from 'src/database/commands/upgrade-version-command/2-37/utils/plan-company-domain-name-normalization.util';

const company = (
  id: string,
  primaryLinkUrl: string,
  secondaryLinks: { url: string; label: string }[] | null = null,
) => ({
  id,
  domainName: { primaryLinkLabel: '', primaryLinkUrl, secondaryLinks },
});

describe('planCompanyDomainNameNormalization', () => {
  it('should rewrite a company whose only stale link is a secondary one', () => {
    const { updates, skippedCompanyIds } = planCompanyDomainNameNormalization([
      company('acme', 'acme.com', [
        { url: 'https://www.beta.com', label: 'Merged away' },
      ]),
    ]);

    expect(skippedCompanyIds).toEqual([]);
    expect(updates).toEqual([
      {
        id: 'acme',
        domainName: {
          primaryLinkLabel: '',
          primaryLinkUrl: 'acme.com',
          secondaryLinks: [{ url: 'beta.com', label: 'Merged away' }],
        },
      },
    ]);
  });

  it('should skip a company whose normalized domain another company already holds', () => {
    const { updates, skippedCompanyIds } = planCompanyDomainNameNormalization([
      company('bare', 'acme.com'),
      company('prefixed', 'https://www.acme.com'),
    ]);

    expect(updates).toEqual([]);
    expect(skippedCompanyIds).toEqual(['prefixed']);
  });

  it('should free the old spelling so a second company can take it', () => {
    const { updates, skippedCompanyIds } = planCompanyDomainNameNormalization([
      company('first', 'https://acme.com'),
      company('second', 'https://acme.com/careers'),
    ]);

    expect(skippedCompanyIds).toEqual(['second']);
    expect(updates.map(({ id }) => id)).toEqual(['first']);
  });

  it('should leave companies that are already canonical alone', () => {
    expect(
      planCompanyDomainNameNormalization([
        company('acme', 'acme.com', [{ url: 'beta.com', label: '' }]),
      ]),
    ).toEqual({ updates: [], skippedCompanyIds: [] });
  });

  it('should ignore a company without a domain name', () => {
    expect(
      planCompanyDomainNameNormalization([{ id: 'empty', domainName: null }]),
    ).toEqual({ updates: [], skippedCompanyIds: [] });
  });
});
