import { findChatReferences } from '@/ai/utils/findChatReferences';

describe('findChatReferences', () => {
  it('should leave plain text without matches', () => {
    expect(findChatReferences('Which company should we contact?')).toEqual([]);
  });

  it('should find a tagged record reference', () => {
    expect(
      findChatReferences(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] next',
      ),
    ).toEqual([
      {
        kind: 'record',
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
      findChatReferences(
        'The company is [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test] [test] ###[[/record]], created on July 21',
      ),
    ).toEqual([
      {
        kind: 'record',
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

  it('should still support legacy ]] inside display names', () => {
    expect(
      findChatReferences(
        'The company is [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] ]] [test] [test] ###]], created on July 21',
      ),
    ).toEqual([
      {
        kind: 'record',
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
      findChatReferences(
        'Merge [[person:11111111-1111-1111-1111-111111111111:Alice[[/record]] into [[record:person:22222222-2222-2222-2222-222222222222:Bob[[/record]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[person:11111111-1111-1111-1111-111111111111:Alice[[/record]]',
        index: 6,
        objectNameSingular: 'person',
        recordId: '11111111-1111-1111-1111-111111111111',
        displayName: 'Alice',
      },
      {
        kind: 'record',
        fullMatch:
          '[[record:person:22222222-2222-2222-2222-222222222222:Bob[[/record]]',
        index: 74,
        objectNameSingular: 'person',
        recordId: '22222222-2222-2222-2222-222222222222',
        displayName: 'Bob',
      },
    ]);
  });

  it('should find an object reference', () => {
    expect(
      findChatReferences('Open [[object:partner:Partners[[/object]] to start'),
    ).toEqual([
      {
        kind: 'object',
        fullMatch: '[[object:partner:Partners[[/object]]',
        index: 5,
        objectNameSingular: 'partner',
        displayName: 'Partners',
      },
    ]);
  });

  it('should find a field reference instead of reading it as a record', () => {
    expect(
      findChatReferences(
        'The [[field:33333333-3333-3333-3333-333333333333:Stage[[/field]] field',
      ),
    ).toEqual([
      {
        kind: 'field',
        fullMatch:
          '[[field:33333333-3333-3333-3333-333333333333:Stage[[/field]]',
        index: 4,
        fieldMetadataItemId: '33333333-3333-3333-3333-333333333333',
        displayName: 'Stage',
      },
    ]);
  });

  it('should find a view reference instead of reading it as a record', () => {
    expect(
      findChatReferences(
        'See [[view:44444444-4444-4444-4444-444444444444:All Companies[[/view]]',
      ),
    ).toEqual([
      {
        kind: 'view',
        fullMatch:
          '[[view:44444444-4444-4444-4444-444444444444:All Companies[[/view]]',
        index: 4,
        viewId: '44444444-4444-4444-4444-444444444444',
        displayName: 'All Companies',
      },
    ]);
  });

  it('should read an explicit record prefix as a record even when the object is named view', () => {
    expect(
      findChatReferences(
        'Open [[record:view:44444444-4444-4444-4444-444444444444:Quarterly[[/record]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[record:view:44444444-4444-4444-4444-444444444444:Quarterly[[/record]]',
        index: 5,
        objectNameSingular: 'view',
        recordId: '44444444-4444-4444-4444-444444444444',
        displayName: 'Quarterly',
      },
    ]);
  });

  it('should drop a metadata reference closed by a foreign tag', () => {
    expect(
      findChatReferences(
        'See [[view:44444444-4444-4444-4444-444444444444:All Companies[[/record]]',
      ),
    ).toEqual([]);
  });

  it('should support a bare legacy terminator on a metadata reference', () => {
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

  it('should find legacy object references in a markdown table row', () => {
    const references = findChatReferences(
      '| Owner | Many-to-one | [[object:workspaceMember:Workspace Member]] |\n| Company | Many-to-one | [[object:company:Company]] |',
    );

    expect(references.map((reference) => reference.displayName)).toEqual([
      'Workspace Member',
      'Company',
    ]);
  });

  it('should find a legacy object reference in a heading', () => {
    const references = findChatReferences(
      '## [[object:project:Project]] object created',
    );

    expect(references).toEqual([
      {
        kind: 'object',
        fullMatch: '[[object:project:Project]]',
        index: 3,
        objectNameSingular: 'project',
        displayName: 'Project',
      },
    ]);
  });

  it('should not let a legacy record swallow a foreign close tag', () => {
    expect(
      findChatReferences(
        '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] blah [[/object]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]]',
        index: 0,
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      },
    ]);
  });

  it('should match object names containing digits', () => {
    expect(
      findChatReferences(
        '[[record:company2:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] and [[object:company2:Companies 2[[/object]]',
      ),
    ).toEqual([
      {
        kind: 'record',
        fullMatch:
          '[[record:company2:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]]',
        index: 0,
        objectNameSingular: 'company2',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      },
      {
        kind: 'object',
        fullMatch: '[[object:company2:Companies 2[[/object]]',
        index: 75,
        objectNameSingular: 'company2',
        displayName: 'Companies 2',
      },
    ]);
  });

  it('should find every kind in a single string', () => {
    const references = findChatReferences(
      'The [[view:44444444-4444-4444-4444-444444444444:Pipeline[[/view]] view of [[object:partner:Partners[[/object]] groups [[record:person:11111111-1111-1111-1111-111111111111:Alice[[/record]] by [[field:33333333-3333-3333-3333-333333333333:Stage[[/field]]',
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
      '[[object:partner:Partners[[/object]][[object:company:Companies[[/object]]',
    );

    expect(references).toHaveLength(2);
    expect(references[0].displayName).toBe('Partners');
    expect(references[1].displayName).toBe('Companies');
    expect(references[1].index).toBe(36);
  });

  it('should drop an unclosed reference', () => {
    expect(findChatReferences('Open [[object:partner:Partners')).toEqual([]);
  });

  it('should consume a surplus bracket added after the closing tag', () => {
    expect(
      findChatReferences(
        'Created [[object:opportunity:Opportunities[[/object]]].',
      ),
    ).toEqual([
      {
        kind: 'object',
        fullMatch: '[[object:opportunity:Opportunities[[/object]]]',
        index: 8,
        objectNameSingular: 'opportunity',
        displayName: 'Opportunities',
      },
    ]);
  });

  it('should consume the extra brackets of an over-wrapped reference', () => {
    expect(
      findChatReferences('Created [[[object:partner:Partners[[/object]]]] now'),
    ).toEqual([
      {
        kind: 'object',
        fullMatch: '[[[object:partner:Partners[[/object]]]]',
        index: 8,
        objectNameSingular: 'partner',
        displayName: 'Partners',
      },
    ]);
  });

  it('should not consume a bracket separated from the closing tag', () => {
    expect(
      findChatReferences('Created [[object:partner:Partners[[/object]] ] now'),
    ).toEqual([
      {
        kind: 'object',
        fullMatch: '[[object:partner:Partners[[/object]]',
        index: 8,
        objectNameSingular: 'partner',
        displayName: 'Partners',
      },
    ]);
  });
});
