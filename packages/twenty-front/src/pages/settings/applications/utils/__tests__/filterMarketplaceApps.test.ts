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
    expect(filterMarketplaceApps(apps, '')).toEqual(apps);
    expect(filterMarketplaceApps(apps, '   \t')).toEqual(apps);
  });

  it('matches case-insensitively on name, description, author and category', () => {
    expect(
      filterMarketplaceApps(apps, 'SLACK').map(({ name }) => name),
    ).toEqual(['Slack']);
    expect(
      filterMarketplaceApps(apps, 'enrich').map(({ name }) => name),
    ).toEqual(['People Data Labs']);
    expect(filterMarketplaceApps(apps, 'twenty')).toHaveLength(2);
    expect(
      filterMarketplaceApps(apps, 'communication').map(({ name }) => name),
    ).toEqual(['Slack']);
  });

  it('ignores surrounding whitespace in the search term', () => {
    expect(
      filterMarketplaceApps(apps, '  people data  ').map(({ name }) => name),
    ).toEqual(['People Data Labs']);
  });

  it('matches non-latin text and emoji', () => {
    expect(filterMarketplaceApps(apps, '🚀')).toHaveLength(1);
    expect(filterMarketplaceApps(apps, 'وصف')).toHaveLength(1);
    expect(filterMarketplaceApps(apps, 'zoë')).toHaveLength(1);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterMarketplaceApps(apps, '<script>')).toEqual([]);
  });
});
