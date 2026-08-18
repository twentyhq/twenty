import { formatRecordReference } from '@/ai/utils/formatRecordReference';

describe('formatRecordReference', () => {
  it('should close the reference with ]]', () => {
    expect(
      formatRecordReference({
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      }),
    ).toBe('[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]]');
  });
});
