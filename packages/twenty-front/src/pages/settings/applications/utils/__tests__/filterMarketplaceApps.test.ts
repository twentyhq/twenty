import { filterMarketplaceApps } from '~/pages/settings/applications/utils/filterMarketplaceApps';

const apps = [
  {
    name: 'Slack',
    description: 'Your CRM, in the conversation.',
    author: 'Twenty',
    category: 'Communication',
  },
  {
    name: 'People Data Labs',
    description: 'Enrich People and Companies.',
    author: 'Twenty',
    category: 'Enrichment',
  },
  {
    name: 'מערכת 🚀',
    description: 'وصف',
    author: 'Zoë',
    category: '',
  },
];

describe('filterMarketplaceApps', () => {
  it('returns every app for an empty or whitespace-only search', () => {
    expect(
      filterMarketplaceApps({ marketplaceApps: apps, searchTerm: '' }),
    ).toEqual(apps);
    expect(
      filterMarketplaceApps({ marketplaceApps: apps, searchTerm: '   \t' }),
    ).toEqual(apps);
  });

  it('matches case-insensitively on name, description, author and category', () => {
    expect(
      filterMarketplaceApps({ marketplaceApps: apps, searchTerm: 'SLACK' }).map(
        ({ name }) => name,
      ),
    ).toEqual(['Slack']);
    expect(
      filterMarketplaceApps({
        marketplaceApps: apps,
        searchTerm: 'enrich',
      }).map(({ name }) => name),
    ).toEqual(['People Data Labs']);
    expect(
      filterMarketplaceApps({ marketplaceApps: apps, searchTerm: 'twenty' }),
    ).toHaveLength(2);
    expect(
      filterMarketplaceApps({
        marketplaceApps: apps,
        searchTerm: 'communication',
      }).map(({ name }) => name),
    ).toEqual(['Slack']);
  });

  it('ignores surrounding whitespace in the search term', () => {
    expect(
      filterMarketplaceApps({
        marketplaceApps: apps,
        searchTerm: '  people data  ',
      }).map(({ name }) => name),
    ).toEqual(['People Data Labs']);
  });

  it('matches non-latin text and emoji', () => {
    expect(
      filterMarketplaceApps({ marketplaceApps: apps, searchTerm: '🚀' }),
    ).toHaveLength(1);
    expect(
      filterMarketplaceApps({ marketplaceApps: apps, searchTerm: 'وصف' }),
    ).toHaveLength(1);
    expect(
      filterMarketplaceApps({ marketplaceApps: apps, searchTerm: 'zoë' }),
    ).toHaveLength(1);
  });

  it('returns nothing when nothing matches', () => {
    expect(
      filterMarketplaceApps({ marketplaceApps: apps, searchTerm: '<script>' }),
    ).toEqual([]);
  });
});
