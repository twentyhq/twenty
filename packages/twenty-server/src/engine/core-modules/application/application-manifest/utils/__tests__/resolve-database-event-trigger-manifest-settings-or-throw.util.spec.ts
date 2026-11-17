import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildDatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/utils/build-database-event-trigger-manifest-lookup.util';
import { resolveDatabaseEventTriggerManifestSettingsOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/resolve-database-event-trigger-manifest-settings-or-throw.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const OPPORTUNITY = '11111111-1111-4111-8111-111111111111';
const STAGE = '22222222-2222-4222-8222-222222222222';
const COMPANY = '33333333-3333-4333-8333-333333333333';
const POINT_OF_CONTACTS = '44444444-4444-4444-8444-444444444444';
const SIGNAL = '55555555-5555-4555-8555-555555555555';
const SIGNAL_STATUS = '66666666-6666-4666-8666-666666666666';
const COMPANY_OBJECT = '88888888-8888-4888-8888-888888888888';
const COMPANY_NAME = '99999999-9999-4999-8999-999999999999';
const ARCHIVED_SCORE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const addField = (
  maps: ReturnType<typeof createEmptyAllFlatEntityMaps>,
  field: Pick<FlatFieldMetadata, 'universalIdentifier' | 'name' | 'type'> & {
    objectMetadataUniversalIdentifier: string;
    universalSettings?: FlatFieldMetadata['universalSettings'];
    relationTargetObjectMetadataUniversalIdentifier?: string;
    isActive?: boolean;
  },
) => {
  maps.flatFieldMetadataMaps.byUniversalIdentifier[field.universalIdentifier] =
    { universalSettings: null, ...field } as unknown as FlatFieldMetadata;
};

const buildLookup = () => {
  const existing = createEmptyAllFlatEntityMaps();
  const manifest = createEmptyAllFlatEntityMaps();

  existing.flatObjectMetadataMaps.byUniversalIdentifier[OPPORTUNITY] = {
    universalIdentifier: OPPORTUNITY,
    nameSingular: 'opportunity',
  } as FlatObjectMetadata;
  addField(existing, {
    universalIdentifier: STAGE,
    name: 'stage',
    type: FieldMetadataType.SELECT,
    objectMetadataUniversalIdentifier: OPPORTUNITY,
  });
  addField(existing, {
    universalIdentifier: COMPANY,
    name: 'company',
    type: FieldMetadataType.RELATION,
    objectMetadataUniversalIdentifier: OPPORTUNITY,
    universalSettings: { relationType: RelationType.MANY_TO_ONE },
    relationTargetObjectMetadataUniversalIdentifier: COMPANY_OBJECT,
  } as Parameters<typeof addField>[1]);
  existing.flatObjectMetadataMaps.byUniversalIdentifier[COMPANY_OBJECT] = {
    universalIdentifier: COMPANY_OBJECT,
    nameSingular: 'company',
  } as FlatObjectMetadata;
  addField(existing, {
    universalIdentifier: COMPANY_NAME,
    name: 'name',
    type: FieldMetadataType.TEXT,
    objectMetadataUniversalIdentifier: COMPANY_OBJECT,
  });
  addField(existing, {
    universalIdentifier: ARCHIVED_SCORE,
    name: 'archivedScore',
    type: FieldMetadataType.NUMBER,
    objectMetadataUniversalIdentifier: OPPORTUNITY,
    isActive: false,
  });
  addField(existing, {
    universalIdentifier: POINT_OF_CONTACTS,
    name: 'pointOfContacts',
    type: FieldMetadataType.RELATION,
    objectMetadataUniversalIdentifier: OPPORTUNITY,
    universalSettings: { relationType: RelationType.ONE_TO_MANY },
  } as Parameters<typeof addField>[1]);

  manifest.flatObjectMetadataMaps.byUniversalIdentifier[SIGNAL] = {
    universalIdentifier: SIGNAL,
    applicationUniversalIdentifier: '77777777-7777-4777-8777-777777777777',
    nameSingular: 'signal',
  } as FlatObjectMetadata;
  addField(manifest, {
    universalIdentifier: SIGNAL_STATUS,
    name: 'status',
    type: FieldMetadataType.SELECT,
    objectMetadataUniversalIdentifier: SIGNAL,
  });

  return buildDatabaseEventTriggerManifestLookup({
    manifestFlatEntityMaps: manifest,
    existingFlatEntityMaps: existing,
  });
};

const resolve = (
  settings: Parameters<
    typeof resolveDatabaseEventTriggerManifestSettingsOrThrow
  >[0]['settings'],
) =>
  resolveDatabaseEventTriggerManifestSettingsOrThrow({
    settings,
    lookup: buildLookup(),
    subject: 'Agent deal-watcher',
  });

describe('resolveDatabaseEventTriggerManifestSettingsOrThrow', () => {
  it('turns an object, its fields and a condition into the stored settings', () => {
    expect(
      resolve({
        objectUniversalIdentifier: OPPORTUNITY,
        on: 'recordEvent' as const,
        action: 'updated',
        watchedFieldUniversalIdentifiers: [STAGE, COMPANY],
        condition: "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'",
        batchMode: true,
      }),
    ).toEqual({
      eventName: 'opportunity.updated',
      updatedFields: ['stage', 'companyId'],
      condition: "stage == 'CUSTOMER' and previous.stage != 'CUSTOMER'",
      conditionBindings: { stage: STAGE, 'previous.stage': STAGE },
      batchMode: true,
    });
  });

  it('reads objects defined by the application itself', () => {
    expect(
      resolve({
        objectUniversalIdentifier: SIGNAL,
        on: 'recordEvent' as const,
        action: 'created',
        condition: "status == 'NEW'",
      }),
    ).toEqual({
      eventName: 'signal.created',
      condition: "status == 'NEW'",
      conditionBindings: { status: SIGNAL_STATUS },
    });
  });

  it('listens to every object when no object is given', () => {
    expect(resolve({ on: 'recordEvent', action: '*' })).toEqual({
      eventName: '*.*',
    });
  });

  it('keeps the event name form and checks its condition against the object', () => {
    expect(
      resolve({
        eventName: 'opportunity.created',
        condition: "isDefined(company) and company.name != 'Acme'",
      }),
    ).toEqual({
      eventName: 'opportunity.created',
      condition: "isDefined(company) and company.name != 'Acme'",
      conditionBindings: { company: COMPANY, 'company.name': COMPANY_NAME },
    });

    expect(() =>
      resolve({ eventName: 'opportunity.created', condition: 'amount > 0' }),
    ).toThrow(/condition "amount > 0" is invalid/);
  });

  it.each([
    [
      'an unknown object',
      {
        on: 'recordEvent' as const,
        objectUniversalIdentifier: STAGE,
        action: 'created' as const,
      },
      /unknown object/,
    ],
    [
      'a field of another object',
      {
        objectUniversalIdentifier: OPPORTUNITY,
        on: 'recordEvent' as const,
        action: 'updated' as const,
        watchedFieldUniversalIdentifiers: [SIGNAL_STATUS],
      },
      /is not on the trigger's object/,
    ],
    [
      'a relation to many records',
      {
        objectUniversalIdentifier: OPPORTUNITY,
        on: 'recordEvent' as const,
        action: 'updated' as const,
        watchedFieldUniversalIdentifiers: [POINT_OF_CONTACTS],
      },
      /pointOfContacts cannot be watched/,
    ],
    [
      'a condition without an object',
      {
        on: 'recordEvent' as const,
        action: 'created' as const,
        condition: 'isDefined(name)',
      },
      /a condition needs a trigger on one object/,
    ],
    [
      'a condition reading a relation by its join column',
      {
        objectUniversalIdentifier: OPPORTUNITY,
        on: 'recordEvent' as const,
        action: 'created' as const,
        condition: 'isDefined(companyId)',
      },
      /Unknown field "companyId"/,
    ],
    [
      'a condition reading a field the related record lacks',
      {
        on: 'recordEvent' as const,
        objectUniversalIdentifier: OPPORTUNITY,
        action: 'created' as const,
        condition: "company.domain == 'acme.com'",
      },
      /Unknown field "domain" on "company"/,
    ],
  ])('rejects %s', (_, settings, error) => {
    expect(() => resolve(settings)).toThrow(error);
  });
});

describe('resolveDatabaseEventTriggerManifestSettingsOrThrow built-in fields', () => {
  it('reads the system fields of an object the application creates', () => {
    expect(
      resolve({
        objectUniversalIdentifier: SIGNAL,
        on: 'recordEvent' as const,
        action: 'created',
        condition: 'isDefined(createdAt)',
      }),
    ).toEqual({
      eventName: 'signal.created',
      condition: 'isDefined(createdAt)',
      conditionBindings: { createdAt: expect.any(String) },
    });
  });

  it('rejects a condition reading an inactive field, which dispatch cannot read', () => {
    expect(() =>
      resolve({
        objectUniversalIdentifier: OPPORTUNITY,
        on: 'recordEvent' as const,
        action: 'updated',
        condition: 'archivedScore > 1',
      }),
    ).toThrow(/is invalid/);
  });

  it('rejects a condition that is not text', () => {
    expect(() =>
      resolve({
        objectUniversalIdentifier: SIGNAL,
        on: 'recordEvent' as const,
        action: 'created',
        condition: false as unknown as string,
      }),
    ).toThrow(/the condition must be text/);
  });
});
