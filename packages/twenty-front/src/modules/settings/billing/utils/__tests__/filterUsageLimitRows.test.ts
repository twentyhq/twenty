import { IconCoins } from 'twenty-ui/icon';

import { type UsageLimitRow } from '@/settings/billing/types/UsageLimitRow';
import { filterUsageLimitRows } from '@/settings/billing/utils/filterUsageLimitRows';
import { UsageResourceType } from '~/generated-metadata/graphql';

const buildRow = (overrides: Partial<UsageLimitRow> = {}): UsageLimitRow => ({
  id: 'row-id',
  name: 'AI · AI Chat',
  NameIcon: IconCoins,
  spenderName: 'Tim Cook',
  spenderAvatarUrl: null,
  spenderType: 'userWorkspace',
  resourceType: UsageResourceType.AI,
  consumedPercentage: 60,
  consumedText: '60 credits',
  limitText: '100 credits',
  isCreditsMeter: true,
  isExhausted: false,
  periodName: 'Monthly',
  ...overrides,
});

const filter = (
  rows: UsageLimitRow[],
  overrides: {
    searchText?: string;
    resourceType?: UsageResourceType | null;
    spenderType?: string | null;
  } = {},
) =>
  filterUsageLimitRows({
    rows,
    searchText: '',
    resourceType: null,
    spenderType: null,
    ...overrides,
  });

describe('filterUsageLimitRows', () => {
  it('keeps every row when nothing is searched or filtered', () => {
    const rows = [buildRow(), buildRow({ id: 'other' })];

    expect(filter(rows)).toEqual(rows);
  });

  it('matches the usage regardless of case and accents', () => {
    const rows = [buildRow({ name: 'AI · Résumé Generation' }), buildRow()];

    expect(filter(rows, { searchText: 'resume' })).toEqual([rows[0]]);
  });

  it('matches the resource named in the usage', () => {
    const rows = [
      buildRow(),
      buildRow({ id: 'api', name: 'API · API Request' }),
    ];

    expect(filter(rows, { searchText: 'api' })).toEqual([rows[1]]);
  });

  it('matches the spender name too', () => {
    const rows = [buildRow(), buildRow({ id: 'key', spenderName: 'Prod key' })];

    expect(filter(rows, { searchText: 'prod' })).toEqual([rows[1]]);
  });

  it('keeps only the chosen resource', () => {
    const rows = [
      buildRow(),
      buildRow({ id: 'api', resourceType: UsageResourceType.API }),
    ];

    expect(filter(rows, { resourceType: UsageResourceType.API })).toEqual([
      rows[1],
    ]);
  });

  it('keeps only the chosen spender type', () => {
    const rows = [
      buildRow(),
      buildRow({ id: 'workspace-wide', spenderType: 'workspace' }),
    ];

    expect(filter(rows, { spenderType: 'workspace' })).toEqual([rows[1]]);
  });

  it('applies the resource and the spender together', () => {
    const rows = [
      buildRow(),
      buildRow({ id: 'workspace-wide', spenderType: 'workspace' }),
      buildRow({
        id: 'api-workspace',
        resourceType: UsageResourceType.API,
        spenderType: 'workspace',
      }),
    ];

    expect(
      filter(rows, {
        resourceType: UsageResourceType.API,
        spenderType: 'workspace',
      }),
    ).toEqual([rows[2]]);
  });

  it('drops rows without a resource when one is chosen', () => {
    const rows = [buildRow({ resourceType: null })];

    expect(filter(rows, { resourceType: UsageResourceType.AI })).toEqual([]);
  });
});
