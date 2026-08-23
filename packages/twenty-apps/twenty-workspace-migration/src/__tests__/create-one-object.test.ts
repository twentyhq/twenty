import { describe, expect, it } from 'vitest';
import { createOneObject } from 'src/logic-functions/requests/create-one-object.util';
import { CreateOneObjectType } from 'src/logic-functions/types/create-one-object.type';
import { createMockGraphqlClient } from 'src/__tests__/utils/mock-graphql-client';
import { ObjectOpenRecordIn, ObjectType } from 'src/logic-functions/types/find-objects-fields.type';

// The keys CreateObjectInput declares server-side. applicationId and universalIdentifier are
// @HideField() there, so they aren't in the schema at all and count as rejected too.
const ACCEPTED_INPUT_KEYS = [
  'nameSingular',
  'namePlural',
  'labelSingular',
  'labelPlural',
  'description',
  'icon',
  'color',
  'isLabelSyncedWithName',
  'skipNameField',
];

const buildSourceObject = (): ObjectType => ({
  applicationId: 'app-1',
  color: 'blue',
  description: 'A custom object',
  fieldsList: [],
  icon: 'IconBuilding',
  id: 'source-object-1',
  isActive: true,
  isLabelSyncedWithName: false,
  isSystem: false,
  labelIdentifierFieldMetadataId: 'source-field-1',
  labelPlural: 'Widgets',
  labelSingular: 'Widget',
  namePlural: 'widgets',
  nameSingular: 'widget',
  openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
  universalIdentifier: 'universal-object-1',
});

describe('createOneObject', () => {
  it('sends only the fields CreateObjectInput accepts, even when spread a full ObjectType', async () => {
    // Regression: callers spread a source ObjectType in, and Omit on CreateOneObjectType is
    // compile-time only - the extra keys survived to the wire and GraphQL rejected the whole
    // mutation, so every workspace with a custom object failed stage 1.
    const { client, calls } = createMockGraphqlClient({
      createOneObject: { createOneObject: { id: 'target-object-1', nameSingular: 'widget', universalIdentifier: 'universal-object-1' } },
    });

    await createOneObject(client, { ...buildSourceObject(), skipNameField: false } as CreateOneObjectType);

    const sentObject = (calls[0].variables.input as { object: Record<string, unknown> }).object;
    expect(Object.keys(sentObject).sort()).toEqual([...ACCEPTED_INPUT_KEYS].sort());
  });

  it('forwards the accepted values unchanged', async () => {
    const { client, calls } = createMockGraphqlClient({
      createOneObject: { createOneObject: { id: 'target-object-1', nameSingular: 'widget', universalIdentifier: 'universal-object-1' } },
    });

    await createOneObject(client, { ...buildSourceObject(), skipNameField: true } as CreateOneObjectType);

    const sentObject = (calls[0].variables.input as { object: Record<string, unknown> }).object;
    expect(sentObject).toEqual({
      nameSingular: 'widget',
      namePlural: 'widgets',
      labelSingular: 'Widget',
      labelPlural: 'Widgets',
      description: 'A custom object',
      icon: 'IconBuilding',
      color: 'blue',
      isLabelSyncedWithName: false,
      skipNameField: true,
    });
  });
});
