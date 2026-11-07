import { getRecordTableColumnFooterAggregateFilter } from '@/object-record/record-table/record-table-footer/utils/getRecordTableColumnFooterAggregateFilter';

const VIEW_FILTER = { stage: { in: ['NEW', 'WON'] } };
const RECORD_GROUP_FILTER = { stage: { eq: 'WON' } };
const ANY_FIELD_FILTER = { name: { ilike: '%acme%' } };
const ADDITIONAL_FILTER = { closeDate: { gte: '2026-01-01' } };

describe('getRecordTableColumnFooterAggregateFilter', () => {
  it('should keep the view filter when the record group filters the same field', () => {
    expect(
      getRecordTableColumnFooterAggregateFilter({
        viewFilter: VIEW_FILTER,
        recordGroupFilter: RECORD_GROUP_FILTER,
        anyFieldFilter: {},
        additionalFilter: {},
      }),
    ).toEqual({ and: [VIEW_FILTER, RECORD_GROUP_FILTER] });
  });

  it('should AND every non-empty filter, the additional filter included', () => {
    expect(
      getRecordTableColumnFooterAggregateFilter({
        viewFilter: VIEW_FILTER,
        recordGroupFilter: RECORD_GROUP_FILTER,
        anyFieldFilter: ANY_FIELD_FILTER,
        additionalFilter: ADDITIONAL_FILTER,
      }),
    ).toEqual({
      and: [
        VIEW_FILTER,
        RECORD_GROUP_FILTER,
        ANY_FIELD_FILTER,
        ADDITIONAL_FILTER,
      ],
    });
  });

  it('should return the additional filter alone when nothing else filters', () => {
    expect(
      getRecordTableColumnFooterAggregateFilter({
        viewFilter: {},
        recordGroupFilter: {},
        anyFieldFilter: {},
        additionalFilter: ADDITIONAL_FILTER,
      }),
    ).toEqual(ADDITIONAL_FILTER);
  });
});
