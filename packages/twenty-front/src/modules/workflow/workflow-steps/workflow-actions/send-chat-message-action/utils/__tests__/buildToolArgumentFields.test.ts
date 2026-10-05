import { buildToolArgumentFields } from '@/workflow/workflow-steps/workflow-actions/send-chat-message-action/utils/buildToolArgumentFields';

describe('buildToolArgumentFields', () => {
  it('lists required arguments first, with their description', () => {
    const fields = buildToolArgumentFields({
      jsonSchema: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'Where it happens' },
          startsAt: { type: 'string', description: 'ISO 8601 start' },
          isFullDay: { type: 'boolean' },
        },
        required: ['startsAt'],
      },
      savedArgumentNames: [],
    });

    expect(fields).toEqual([
      {
        name: 'startsAt',
        label: 'Starts at',
        description: 'ISO 8601 start',
        isRequired: true,
        isListed: true,
        schemaProperty: { type: 'string' },
      },
      {
        name: 'location',
        label: 'Location',
        description: 'Where it happens',
        isRequired: false,
        isListed: true,
        schemaProperty: { type: 'string' },
      },
      {
        name: 'isFullDay',
        label: 'Is full day',
        description: undefined,
        isRequired: false,
        isListed: true,
        schemaProperty: { type: 'boolean' },
      },
    ]);
  });

  it('edits objects and unions as JSON', () => {
    const fields = buildToolArgumentFields({
      jsonSchema: {
        type: 'object',
        properties: {
          address: { $ref: '#/$defs/AddressValue' },
          position: { anyOf: [{ type: 'number' }, { type: 'string' }] },
          workPolicy: {
            type: 'array',
            items: { type: 'string', enum: ['ON_SITE', 'REMOTE_WORK'] },
          },
        },
      },
      savedArgumentNames: [],
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

  it('keeps arguments the schema does not list, so they can be filled or removed', () => {
    const fields = buildToolArgumentFields({
      jsonSchema: {
        type: 'object',
        properties: { title: { type: 'string' } },
        required: ['title', 'calendarId'],
      },
      savedArgumentNames: ['title', 'legacyNote'],
    });

    expect(
      fields?.map(({ name, isRequired, isListed }) => ({
        name,
        isRequired,
        isListed,
      })),
    ).toEqual([
      { name: 'title', isRequired: true, isListed: true },
      { name: 'calendarId', isRequired: true, isListed: true },
      { name: 'legacyNote', isRequired: false, isListed: false },
    ]);
  });

  it.each([null, {}, { type: 'object', properties: {} }])(
    'falls back to JSON without listed arguments (%j)',
    (jsonSchema) => {
      expect(
        buildToolArgumentFields({ jsonSchema, savedArgumentNames: [] }),
      ).toBeNull();
    },
  );
});
