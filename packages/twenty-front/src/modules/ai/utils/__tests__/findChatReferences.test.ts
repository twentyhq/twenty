import { findChatReferences } from '@/ai/utils/findChatReferences';

describe('findChatReferences', () => {
  it('should leave plain text without matches', () => {
    expect(findChatReferences('Which company should we contact?')).toEqual([]);
  });

  it('should find a record reference', () => {
    expect(
      findChatReferences(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]]',
        index: 8,
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      },
    ]);
  });

  it('should find a record reference written without the record prefix', () => {
    expect(
      findChatReferences(
        'Merge [[person:11111111-1111-1111-1111-111111111111:Alice]] into [[record:person:22222222-2222-2222-2222-222222222222:Bob]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch: '[[person:11111111-1111-1111-1111-111111111111:Alice]]',
        index: 6,
        objectNameSingular: 'person',
        recordId: '11111111-1111-1111-1111-111111111111',
        displayName: 'Alice',
      },
      {
        kind: 'record',
        fullMatch: '[[record:person:22222222-2222-2222-2222-222222222222:Bob]]',
        index: 65,
        objectNameSingular: 'person',
        recordId: '22222222-2222-2222-2222-222222222222',
        displayName: 'Bob',
      },
    ]);
  });

  it('should find an object reference', () => {
    expect(
      findChatReferences('Open [[object:partner:Partners]] to start'),
    ).toEqual([
      {
        kind: 'object',
        fullMatch: '[[object:partner:Partners]]',
        index: 5,
        objectNameSingular: 'partner',
        displayName: 'Partners',
      },
    ]);
  });

  it('should find a field reference instead of reading it as a record', () => {
    expect(
      findChatReferences(
        'The [[field:33333333-3333-3333-3333-333333333333:Stage]] field',
      ),
    ).toEqual([
      {
        kind: 'field',
        fullMatch: '[[field:33333333-3333-3333-3333-333333333333:Stage]]',
        index: 4,
        fieldMetadataItemId: '33333333-3333-3333-3333-333333333333',
        displayName: 'Stage',
      },
    ]);
  });

  it('should find a view reference instead of reading it as a record', () => {
    expect(
      findChatReferences(
        'See [[view:44444444-4444-4444-4444-444444444444:All Companies]]',
      ),
    ).toEqual([
      {
        kind: 'view',
        fullMatch:
          '[[view:44444444-4444-4444-4444-444444444444:All Companies]]',
        index: 4,
        viewId: '44444444-4444-4444-4444-444444444444',
        displayName: 'All Companies',
      },
    ]);
  });

  it('should read an explicit record prefix as a record even when the object is named view', () => {
    expect(
      findChatReferences(
        'Open [[record:view:44444444-4444-4444-4444-444444444444:Quarterly]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[record:view:44444444-4444-4444-4444-444444444444:Quarterly]]',
        index: 5,
        objectNameSingular: 'view',
        recordId: '44444444-4444-4444-4444-444444444444',
        displayName: 'Quarterly',
      },
    ]);
  });

  it('should match object names containing digits', () => {
    expect(
      findChatReferences(
        '[[record:company2:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] and [[object:company2:Companies 2]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[record:company2:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]]',
        index: 0,
        objectNameSingular: 'company2',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      },
      {
        kind: 'object',
        fullMatch: '[[object:company2:Companies 2]]',
        index: 66,
        objectNameSingular: 'company2',
        displayName: 'Companies 2',
      },
    ]);
  });

  it('should find every kind in a single string', () => {
    const references = findChatReferences(
      'The [[view:44444444-4444-4444-4444-444444444444:Pipeline]] view of [[object:partner:Partners]] groups [[record:person:11111111-1111-1111-1111-111111111111:Alice]] by [[field:33333333-3333-3333-3333-333333333333:Stage]]',
    );

    expect(references.map((reference) => reference.kind)).toEqual([
      'view',
      'object',
      'record',
      'field',
    ]);
    expect(references.map((reference) => reference.displayName)).toEqual([
      'Pipeline',
      'Partners',
      'Alice',
      'Stage',
    ]);
  });

  it('should find adjacent references without a separator', () => {
    const references = findChatReferences(
      '[[object:partner:Partners]][[object:company:Companies]]',
    );

    expect(references).toHaveLength(2);
    expect(references[0].displayName).toBe('Partners');
    expect(references[1].displayName).toBe('Companies');
    expect(references[1].index).toBe(27);
  });

  it('should find a reference with an empty display name', () => {
    expect(
      findChatReferences(
        '[[record:person:11111111-1111-1111-1111-111111111111:]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch: '[[record:person:11111111-1111-1111-1111-111111111111:]]',
        index: 0,
        objectNameSingular: 'person',
        recordId: '11111111-1111-1111-1111-111111111111',
        displayName: '',
      },
    ]);
  });

  it('should drop an unclosed reference', () => {
    expect(findChatReferences('Open [[object:partner:Partners')).toEqual([]);
  });

  it('should not treat a single bracket as a terminator', () => {
    expect(
      findChatReferences('Open [[object:partner:Partners] to start'),
    ).toEqual([]);
  });

  it('should not let an unclosed reference swallow the next one', () => {
    const references = findChatReferences(
      'Open [[object:partner:Partners [[object:company:Companies]]',
    );

    expect(references).toHaveLength(1);
    expect(references[0].displayName).toBe('Companies');
  });

  it('should not close a reference across a line break', () => {
    expect(
      findChatReferences('Open [[object:partner:Partners\nand others]]'),
    ).toEqual([]);
  });

  it('should drop a reference whose display name contains brackets', () => {
    expect(
      findChatReferences(
        'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] name]]',
      ),
    ).toEqual([]);
  });

  it('should drop a reference closed by a retired closing tag', () => {
    expect(
      findChatReferences(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] and [[object:partner:Partners[[/object]] and [[field:33333333-3333-3333-3333-333333333333:Stage[[/field]] and [[view:44444444-4444-4444-4444-444444444444:Pipeline[[/view]]',
      ),
    ).toEqual([]);
  });

  it('should leave a surplus bracket added after a reference out of the match', () => {
    expect(
      findChatReferences('Created [[object:opportunity:Opportunities]]].'),
    ).toEqual([
      {
        kind: 'object',
        fullMatch: '[[object:opportunity:Opportunities]]',
        index: 8,
        objectNameSingular: 'opportunity',
        displayName: 'Opportunities',
      },
    ]);
  });

  it('should find a reference whose display name contains markdown characters', () => {
    expect(
      findChatReferences(
        'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step]]',
        index: 4,
        objectNameSingular: 'workflow',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Workflow `UPDATE_RECORD` step',
      },
    ]);
  });

  it('should find a reference whose display name contains a colon', () => {
    expect(
      findChatReferences(
        'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]',
        index: 5,
        objectNameSingular: 'person',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Doe: Jane',
      },
    ]);
  });
});
