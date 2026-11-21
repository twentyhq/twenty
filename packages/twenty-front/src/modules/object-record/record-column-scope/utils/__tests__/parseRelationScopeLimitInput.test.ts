import { parseRelationScopeLimitInput } from '@/object-record/record-column-scope/utils/parseRelationScopeLimitInput';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';

describe('parseRelationScopeLimitInput', () => {
  it.each(['', '   '])('reads %j as no limit', (limitInput) => {
    expect(parseRelationScopeLimitInput(limitInput)).toEqual({
      isValid: true,
      limit: null,
    });
  });

  it.each([
    ['1', 1],
    [' 12 ', 12],
    [String(QUERY_MAX_RECORDS_FROM_RELATION), QUERY_MAX_RECORDS_FROM_RELATION],
  ])('reads %j as a limit of %d', (limitInput, limit) => {
    expect(parseRelationScopeLimitInput(limitInput)).toEqual({
      isValid: true,
      limit,
    });
  });

  it.each([
    '0',
    '-3',
    '2.5',
    'abc',
    String(QUERY_MAX_RECORDS_FROM_RELATION + 1),
  ])('rejects %j', (limitInput) => {
    expect(parseRelationScopeLimitInput(limitInput)).toEqual({
      isValid: false,
    });
  });
});
