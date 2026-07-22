import { formatRecordReference } from '@/ai/utils/formatRecordReference';

describe('formatRecordReference', () => {
  it('should use the [[/record]] close tag', () => {
    expect(
      formatRecordReference({
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: '[test] ]] [test]',
      }),
    ).toBe(
      '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test][[/record]]',
    );
  });
});
