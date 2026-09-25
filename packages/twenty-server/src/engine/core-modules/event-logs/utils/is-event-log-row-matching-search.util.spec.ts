import { isEventLogRowMatchingSearch } from 'src/engine/core-modules/event-logs/utils/is-event-log-row-matching-search.util';

const WEBHOOK_DELIVERY_ROW = {
  event: 'Webhook Response',
  properties: {
    eventName: 'company.updated',
    url: 'https://api.acme-bi.com/twenty',
    error: 'Internal Server Error',
  },
};

const SEARCHABLE_FIELDS = [
  'properties.message',
  'properties.eventName',
  'properties.url',
  'properties.error',
];

const RECORD_CHANGE_ROW = {
  properties: {
    after: {
      name: 'Oakridge Foods',
      domainName: 'https://oakridgefoods.com/about',
      deletedAt: null,
    },
  },
};

describe('isEventLogRowMatchingSearch', () => {
  it.each([
    {
      reason: 'a field containing the search in another case',
      search: ' internal SERVER ',
      expected: true,
    },
    {
      reason: 'no field containing the search',
      search: 'slack',
      expected: false,
    },
    {
      reason: 'two words found in two fields',
      search: 'COMPANY.updated internal',
      expected: true,
    },
    {
      reason: 'one word found in no field',
      search: 'company.updated slack',
      expected: false,
    },
    {
      reason: 'a match outside the searchable fields',
      search: 'Webhook Response',
      expected: false,
    },
    { reason: 'a missing field', search: 'undefined', expected: false },
    { reason: 'a blank search', search: '  ', expected: true },
  ])('returns $expected for $reason', ({ search, expected }) => {
    expect(
      isEventLogRowMatchingSearch({
        row: WEBHOOK_DELIVERY_ROW,
        search,
        searchableFields: SEARCHABLE_FIELDS,
      }),
    ).toBe(expected);
  });

  it.each([
    {
      reason: 'a value in a JSON field',
      search: 'oakridge FOODS',
      expected: true,
    },
    {
      reason: 'a JSON key with a null value',
      search: 'deletedAt',
      expected: false,
    },
    {
      reason: 'a slash in a JSON field',
      search: '.com/about',
      expected: false,
    },
  ])('returns $expected for $reason', ({ search, expected }) => {
    expect(
      isEventLogRowMatchingSearch({
        row: RECORD_CHANGE_ROW,
        search,
        searchableFields: ['properties'],
      }),
    ).toBe(expected);
  });
});
