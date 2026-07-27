import { findRecordReferences } from '@/ai/utils/findRecordReferences';

describe('findRecordReferences', () => {
  it('should leave plain text without matches', () => {
    expect(findRecordReferences('Which company should we contact?')).toEqual(
      [],
    );
  });

  it('should find a tagged record reference', () => {
    expect(
      findRecordReferences(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] next',
      ),
    ).toEqual([
      {
        fullMatch:
          '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]]',
        index: 8,
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      },
    ]);
  });

  it('should include ]] inside a tagged display name', () => {
    expect(
      findRecordReferences(
        'The company is [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test] [test] ###[[/record]], created on July 21',
      ),
    ).toEqual([
      {
        fullMatch:
          '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test] [test] ###[[/record]]',
        index: 15,
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: '[test] ]] [test] [test] ###',
      },
    ]);
  });

  it('should still support legacy ]] terminators', () => {
    expect(
      findRecordReferences(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toEqual([
      {
        fullMatch:
          '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]]',
        index: 8,
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      },
    ]);
  });

  it('should still support legacy ]] inside display names', () => {
    expect(
      findRecordReferences(
        'The company is [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test] [test] ###]], created on July 21',
      ),
    ).toEqual([
      {
        fullMatch:
          '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test] [test] ###]]',
        index: 15,
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: '[test] ]] [test] [test] ###',
      },
    ]);
  });

  it('should find multiple tagged references without consuming into the next one', () => {
    expect(
      findRecordReferences(
        'Merge [[person:11111111-1111-1111-1111-111111111111:Alice[[/record]] into [[record:person:22222222-2222-2222-2222-222222222222:Bob[[/record]]',
      ),
    ).toEqual([
      {
        fullMatch:
          '[[person:11111111-1111-1111-1111-111111111111:Alice[[/record]]',
        index: 6,
        objectNameSingular: 'person',
        recordId: '11111111-1111-1111-1111-111111111111',
        displayName: 'Alice',
      },
      {
        fullMatch:
          '[[record:person:22222222-2222-2222-2222-222222222222:Bob[[/record]]',
        index: 74,
        objectNameSingular: 'person',
        recordId: '22222222-2222-2222-2222-222222222222',
        displayName: 'Bob',
      },
    ]);
  });
});
