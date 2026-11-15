import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';

import { parseRecordLimitInput } from '@/views/utils/parseRecordLimitInput';

describe('parseRecordLimitInput', () => {
  it('treats an empty input as no limit', () => {
    expect(parseRecordLimitInput('  ')).toEqual({
      isValid: true,
      recordLimit: null,
    });
  });

  it('accepts a whole number within the relation limit', () => {
    expect(parseRecordLimitInput(' 3 ')).toEqual({
      isValid: true,
      recordLimit: 3,
    });
  });

  it.each(['0', '1.5', '12abc', `${QUERY_MAX_RECORDS_FROM_RELATION + 1}`])(
    'rejects %j',
    (recordLimitInput) => {
      expect(parseRecordLimitInput(recordLimitInput)).toEqual({
        isValid: false,
      });
    },
  );
});
