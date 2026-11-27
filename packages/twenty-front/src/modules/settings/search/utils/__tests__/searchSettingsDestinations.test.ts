import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { searchSettingsDestinations } from '@/settings/search/utils/searchSettingsDestinations';

const LIMITS: SettingsSearchDestination = {
  id: 'limits',
  path: '/settings/billing/limits',
  title: 'Limits',
  breadcrumbs: ['Workspace', 'Billing'],
  keywords: ['Usage limits'],
};

const MEMBERS: SettingsSearchDestination = {
  id: 'members',
  path: '/settings/members',
  title: 'Members',
  breadcrumbs: ['Workspace'],
  keywords: [],
};

const search = (query: string) =>
  searchSettingsDestinations({
    destinations: [LIMITS, MEMBERS],
    search: query,
  }).map(({ id }) => id);

describe('searchSettingsDestinations', () => {
  it('returns nothing for an empty search', () => {
    expect(search('  ')).toEqual([]);
  });

  it('matches titles, breadcrumbs and keywords regardless of case', () => {
    expect(search('MEMB')).toEqual(['members']);
    expect(search('billing')).toEqual(['limits']);
    expect(search('usage limit')).toEqual(['limits']);
    expect(search('workspace')).toEqual(['limits', 'members']);
  });
});
