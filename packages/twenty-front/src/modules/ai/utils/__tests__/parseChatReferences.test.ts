import { parseChatReferences } from '@/ai/utils/parseChatReferences';

describe('parseChatReferences', () => {
  it('should leave plain text without matches', () => {
    expect(parseChatReferences('Which company should we contact?')).toEqual([]);
  });

  it.each([
    {
      name: 'a record',
      text: 'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      reference: {
        kind: 'record',
        fullMatch:
          '[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]]',
        index: 8,
        objectNameSingular: 'company',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      },
    },
    {
      name: 'a record written without the record prefix',
      text: 'Merge [[person:11111111-1111-1111-1111-111111111111:Alice]] first',
      reference: {
        kind: 'record',
        fullMatch: '[[person:11111111-1111-1111-1111-111111111111:Alice]]',
        index: 6,
        objectNameSingular: 'person',
        recordId: '11111111-1111-1111-1111-111111111111',
        displayName: 'Alice',
      },
    },
    {
      name: 'a record whose object is named like a kind',
      text: 'Open [[record:view:44444444-4444-4444-4444-444444444444:Quarterly]]',
      reference: {
        kind: 'record',
        fullMatch:
          '[[record:view:44444444-4444-4444-4444-444444444444:Quarterly]]',
        index: 5,
        objectNameSingular: 'view',
        recordId: '44444444-4444-4444-4444-444444444444',
        displayName: 'Quarterly',
      },
    },
    {
      name: 'a record of an object whose name contains digits',
      text: '[[record:company2:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]]',
      reference: {
        kind: 'record',
        fullMatch:
          '[[record:company2:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]]',
        index: 0,
        objectNameSingular: 'company2',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Acme',
      },
    },
    {
      name: 'a record with an empty display name',
      text: '[[record:person:11111111-1111-1111-1111-111111111111:]]',
      reference: {
        kind: 'record',
        fullMatch: '[[record:person:11111111-1111-1111-1111-111111111111:]]',
        index: 0,
        objectNameSingular: 'person',
        recordId: '11111111-1111-1111-1111-111111111111',
        displayName: '',
      },
    },
    {
      name: 'a record whose display name contains markdown characters',
      text: 'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step]]',
      reference: {
        kind: 'record',
        fullMatch:
          '[[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step]]',
        index: 4,
        objectNameSingular: 'workflow',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Workflow `UPDATE_RECORD` step',
      },
    },
    {
      name: 'a record whose display name contains a colon',
      text: 'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]',
      reference: {
        kind: 'record',
        fullMatch:
          '[[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]',
        index: 5,
        objectNameSingular: 'person',
        recordId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        displayName: 'Doe: Jane',
      },
    },
    {
      name: 'a records reference by object metadata id',
      text: 'Browse [[records:77777777-7777-4777-8777-777777777777:Companies]]',
      reference: {
        kind: 'records',
        fullMatch: '[[records:77777777-7777-4777-8777-777777777777:Companies]]',
        index: 7,
        objectMetadataId: '77777777-7777-4777-8777-777777777777',
        displayName: 'Companies',
      },
    },
    {
      name: 'an object',
      text: 'Open [[object:partner:Partners]] to start',
      reference: {
        kind: 'object',
        fullMatch: '[[object:partner:Partners]]',
        index: 5,
        objectNameSingular: 'partner',
        displayName: 'Partners',
      },
    },
    {
      name: 'an object followed by a surplus bracket',
      text: 'Created [[object:opportunity:Opportunities]]].',
      reference: {
        kind: 'object',
        fullMatch: '[[object:opportunity:Opportunities]]',
        index: 8,
        objectNameSingular: 'opportunity',
        displayName: 'Opportunities',
      },
    },
    {
      name: 'a field addressed by object and field name',
      text: 'The [[field:person:role:Role]] field',
      reference: {
        kind: 'field',
        fullMatch: '[[field:person:role:Role]]',
        index: 4,
        objectNameSingular: 'person',
        fieldName: 'role',
        displayName: 'Role',
      },
    },
    {
      name: 'a view',
      text: 'See [[view:44444444-4444-4444-4444-444444444444:All Companies]]',
      reference: {
        kind: 'view',
        fullMatch:
          '[[view:44444444-4444-4444-4444-444444444444:All Companies]]',
        index: 4,
        viewId: '44444444-4444-4444-4444-444444444444',
        displayName: 'All Companies',
      },
    },
    {
      name: 'a view whose display name contains a colon',
      text: 'See [[view:44444444-4444-4444-4444-444444444444:Q1: Pipeline]]',
      reference: {
        kind: 'view',
        fullMatch: '[[view:44444444-4444-4444-4444-444444444444:Q1: Pipeline]]',
        index: 4,
        viewId: '44444444-4444-4444-4444-444444444444',
        displayName: 'Q1: Pipeline',
      },
    },
    {
      name: 'a role',
      text: 'Review [[role:55555555-5555-4555-8555-555555555555:Admin]]',
      reference: {
        kind: 'role',
        fullMatch: '[[role:55555555-5555-4555-8555-555555555555:Admin]]',
        index: 7,
        roleId: '55555555-5555-4555-8555-555555555555',
        displayName: 'Admin',
      },
    },
    {
      name: 'an app',
      text: 'in [[app:66666666-6666-4666-8666-666666666666:Twenty]]',
      reference: {
        kind: 'app',
        fullMatch: '[[app:66666666-6666-4666-8666-666666666666:Twenty]]',
        index: 3,
        applicationId: '66666666-6666-4666-8666-666666666666',
        displayName: 'Twenty',
      },
    },
  ])('should find $name', ({ text, reference }) => {
    expect(parseChatReferences(text)).toEqual([reference]);
  });

  it('should find every kind in a single string', () => {
    const references = parseChatReferences(
      'The [[view:44444444-4444-4444-4444-444444444444:Pipeline]] view of [[records:77777777-7777-4777-8777-777777777777:Companies]] uses the [[object:partner:Partners]] schema and groups [[record:person:11111111-1111-1111-1111-111111111111:Alice]] by [[field:person:stage:Stage]] for [[role:55555555-5555-4555-8555-555555555555:Admin]] in [[app:66666666-6666-4666-8666-666666666666:Twenty]]',
    );

    expect(references.map((reference) => reference.kind)).toEqual([
      'view',
      'records',
      'object',
      'record',
      'field',
      'role',
      'app',
    ]);
    expect(references.map((reference) => reference.displayName)).toEqual([
      'Pipeline',
      'Companies',
      'Partners',
      'Alice',
      'Stage',
      'Admin',
      'Twenty',
    ]);
  });

  it('should find adjacent references without a separator', () => {
    const references = parseChatReferences(
      '[[object:partner:Partners]][[object:company:Companies]]',
    );

    expect(references).toHaveLength(2);
    expect(references[0].displayName).toBe('Partners');
    expect(references[1].displayName).toBe('Companies');
    expect(references[1].index).toBe(27);
  });

  it('should not let an unclosed reference swallow the next one', () => {
    const references = parseChatReferences(
      'Open [[object:partner:Partners [[object:company:Companies]]',
    );

    expect(references).toHaveLength(1);
    expect(references[0].displayName).toBe('Companies');
  });

  it.each([
    { name: 'an unclosed reference', text: 'Open [[object:partner:Partners' },
    {
      name: 'a reference closed by a single bracket',
      text: 'Open [[object:partner:Partners] to start',
    },
    {
      name: 'a reference closed across a line break',
      text: 'Open [[object:partner:Partners\nand others]]',
    },
    {
      name: 'a reference whose display name contains brackets',
      text: 'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] name]]',
    },
    {
      name: 'references closed by a retired closing tag',
      text: 'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme[[/record]] and [[object:partner:Partners[[/object]] and [[field:person:stage:Stage[[/field]] and [[view:44444444-4444-4444-4444-444444444444:Pipeline[[/view]]',
    },
    {
      name: 'a view whose id is not a uuid',
      text: 'See [[view:pipeline:Pipeline]]',
    },
    {
      name: 'a field missing its field name',
      text: 'The [[field:person:Role]] field',
    },
    {
      name: 'a record whose id is not a uuid',
      text: 'Contact [[record:company:acme:Acme]]',
    },
    {
      name: 'a retired field reference addressed by id',
      text: 'Set [[field:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Amount]] first',
    },
  ])('should drop $name', ({ text }) => {
    expect(parseChatReferences(text)).toEqual([]);
  });
});
