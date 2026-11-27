import { type SettingsSearchDestination } from '@/settings/search/types/SettingsSearchDestination';
import { searchSettingsDestinations } from '@/settings/search/utils/searchSettingsDestinations';

const createDestination = ({
  title,
  breadcrumbs,
  keywords = [],
}: {
  title: string;
  breadcrumbs: string[];
  keywords?: string[];
}): SettingsSearchDestination => ({
  id: [...breadcrumbs, title].join('/'),
  path: `/settings/${title}`,
  title,
  breadcrumbs,
  keywords,
});

const DESTINATIONS = [
  createDestination({ title: 'Billing', breadcrumbs: ['Workspace'] }),
  createDestination({ title: 'Usage', breadcrumbs: ['Workspace', 'Billing'] }),
  createDestination({
    title: 'Limits',
    breadcrumbs: ['Workspace', 'Billing'],
    keywords: ['Usage limits'],
  }),
  createDestination({ title: 'Data model', breadcrumbs: ['Workspace'] }),
  createDestination({
    title: 'People',
    breadcrumbs: ['Workspace', 'Data model'],
  }),
  createDestination({
    title: 'Translations',
    breadcrumbs: ['Workspace', 'Data model', 'People'],
  }),
  createDestination({
    title: 'Translations',
    breadcrumbs: ['Workspace', 'Data model', 'Companies'],
  }),
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

  it('tolerates one typo in words of five letters or more', () => {
    expect(search('limts')).toEqual(['Workspace/Billing/Limits']);
    expect(search('people translaton')).toEqual([
      'Workspace/Data model/People/Translations',
    ]);
    expect(search('people transslation')).toEqual([
      'Workspace/Data model/People/Translations',
    ]);
    expect(search('date')).toEqual([]);
  });

  it('matches inside words for scripts written without spaces', () => {
    expect(
      searchSettingsDestinations({
        destinations: [
          createDestination({ title: '数据模型', breadcrumbs: ['工作区'] }),
        ],
        search: '模型',
      }),
    ).toHaveLength(1);
  });

  it('ignores case and accents', () => {
    expect(search('PÉOPLE')[0]).toBe('Workspace/Data model/People');
  });

  it('requires every word to match', () => {
    expect(search('billing people')).toEqual([]);
  });

  it("boosts the current object's settings", () => {
    const translations = DESTINATIONS.filter(
      ({ title }) => title === 'Translations',
    ).map((destination) => ({
      ...destination,
      objectNamePlural: destination.breadcrumbs.at(-1)?.toLowerCase(),
    }));

    const searchTranslations = (boostedObjectNamePlural?: string) =>
      searchSettingsDestinations({
        destinations: translations,
        search: 'translations',
        boostedObjectNamePlural,
      }).map(({ objectNamePlural }) => objectNamePlural);

    expect(searchTranslations()).toEqual(['people', 'companies']);
    expect(searchTranslations('companies')).toEqual(['companies', 'people']);
  });
});
