import { buildToolArgumentFields } from '@/workflow/workflow-steps/workflow-actions/send-chat-message-action/utils/buildToolArgumentFields';

describe('buildToolArgumentFields', () => {
  it('lists required arguments first, with their description', () => {
    const fields = buildToolArgumentFields({
      type: 'object',
      properties: {
        location: { type: 'string', description: 'Where it happens' },
        startsAt: { type: 'string', description: 'ISO 8601 start' },
        isFullDay: { type: 'boolean' },
      },
      required: ['startsAt'],
    });

    expect(fields).toEqual([
      {
        name: 'startsAt',
        label: 'Starts at',
        description: 'ISO 8601 start',
        isRequired: true,
        schemaProperty: { type: 'string' },
      },
      {
        name: 'location',
        label: 'Location',
        description: 'Where it happens',
        isRequired: false,
        schemaProperty: { type: 'string' },
      },
      {
        name: 'isFullDay',
        label: 'Is full day',
        description: undefined,
        isRequired: false,
        schemaProperty: { type: 'boolean' },
      },
    ]);
  });

  it('edits objects and unions as JSON', () => {
    const fields = buildToolArgumentFields({
      type: 'object',
      properties: {
        address: { $ref: '#/$defs/AddressValue' },
        position: { anyOf: [{ type: 'number' }, { type: 'string' }] },
        workPolicy: {
          type: 'array',
          items: { type: 'string', enum: ['ON_SITE', 'REMOTE_WORK'] },
        },
      },
    });

    expect(
      fields?.map(({ name, schemaProperty }) => ({ name, schemaProperty })),
    ).toEqual([
      { name: 'address', schemaProperty: undefined },
      { name: 'position', schemaProperty: undefined },
      {
        name: 'workPolicy',
        schemaProperty: {
          type: 'array',
          items: { type: 'string', enum: ['ON_SITE', 'REMOTE_WORK'] },
        },
      },
    ]);
  });

  it.each([null, {}, { type: 'object', properties: {} }])(
    'falls back to JSON without listed arguments (%j)',
    (jsonSchema) => {
      expect(buildToolArgumentFields(jsonSchema)).toBeNull();
    },
  );
});
