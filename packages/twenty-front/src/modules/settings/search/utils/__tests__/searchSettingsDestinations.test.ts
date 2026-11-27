import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { searchSettingsDestinations } from '@/settings/search/utils/searchSettingsDestinations';

const createDestination = (
  title: string,
  breadcrumbs: string[],
  keywords: string[] = [],
): SettingsSearchDestination => ({
  id: [...breadcrumbs, title].join('/'),
  path: `/settings/${title}`,
  title,
  breadcrumbs,
  keywords,
});

const DESTINATIONS = [
  createDestination('Billing', ['Workspace']),
  createDestination('Usage', ['Workspace', 'Billing']),
  createDestination('Limits', ['Workspace', 'Billing'], ['Usage limits']),
  createDestination('Data model', ['Workspace']),
  createDestination('People', ['Workspace', 'Data model']),
  createDestination('Translations', ['Workspace', 'Data model', 'People']),
  createDestination('Translations', ['Workspace', 'Data model', 'Companies']),
];

const search = (query: string) =>
  searchSettingsDestinations({ destinations: DESTINATIONS, search: query }).map(
    ({ id }) => id,
  );

describe('searchSettingsDestinations', () => {
  it('returns nothing for an empty search', () => {
    expect(search('  ')).toEqual([]);
  });

  it('matches words across title, breadcrumbs and keywords', () => {
    expect(search('usage limit')).toEqual(['Workspace/Billing/Limits']);
    expect(search('people translation')).toEqual([
      'Workspace/Data model/People/Translations',
    ]);
  });

  it('ranks title matches above breadcrumb matches, shallow first', () => {
    expect(search('billing')).toEqual([
      'Workspace/Billing',
      'Workspace/Billing/Usage',
      'Workspace/Billing/Limits',
    ]);
  });

  it('tolerates one typo in longer words', () => {
    expect(search('limts')).toEqual(['Workspace/Billing/Limits']);
    expect(search('translaton')).toHaveLength(2);
  });

  it('ignores case and accents', () => {
    expect(search('PÉOPLE')[0]).toBe('Workspace/Data model/People');
  });

  it('requires every word to match', () => {
    expect(search('billing people')).toEqual([]);
  });
});
