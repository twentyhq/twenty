import { buildPullEntities } from '@/cli/utilities/pull/build-pull-entities';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { describe, expect, it } from 'vitest';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const PET_NAME_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const COMPANY_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const INDEX_UID = '55555555-5555-4555-8555-555555555555';
const JUNCTION_UID = '66666666-6666-4666-8666-666666666666';
const JUNCTION_ID_FIELD_UID = '77777777-7777-4777-8777-777777777777';

const buildManifest = (overrides: Partial<Manifest> = {}): Manifest =>
  ({
    application: {
      universalIdentifier: APP_UID,
      displayName: 'Pets',
      description: 'Pet tracking',
      defaultRoleUniversalIdentifier: 'role-uid',
      packageJsonChecksum: 'package-checksum',
      yarnLockChecksum: 'lock-checksum',
    },
    objects: [
      {
        universalIdentifier: PET_UID,
        nameSingular: 'pet',
        namePlural: 'pets',
        labelSingular: 'Pet',
        labelPlural: 'Pets',
        labelIdentifierFieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
        fields: [
          {
            universalIdentifier: PET_NAME_FIELD_UID,
            name: 'name',
            label: 'Name',
            type: 'TEXT',
            writability: 'OPEN',
          },
        ],
      },
    ],
    fields: [
      {
        universalIdentifier: COMPANY_FIELD_UID,
        name: 'caredForPets',
        label: 'Cared for pets',
        type: 'TEXT',
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
      },
    ],
    indexes: [],
    ...overrides,
  }) as unknown as Manifest;

describe('buildPullEntities', () => {
  it('should strip the checksums the build recomputes from the application config', () => {
    const { entities } = buildPullEntities(buildManifest());
    const application = entities.find(
      (entity) => entity.kind === 'application',
    );

    expect(application?.config).toEqual({
      universalIdentifier: APP_UID,
      displayName: 'Pets',
      description: 'Pet tracking',
      defaultRoleUniversalIdentifier: 'role-uid',
    });
    expect(
      `${application?.defaultFolder}/${application?.fileBaseName}${application?.fileSuffix}`,
    ).toBe('src/application.config.ts');
  });

  it('should write an object verbatim, keeping its name field and label identifier', () => {
    const manifest = buildManifest();
    const { entities } = buildPullEntities(manifest);
    const object = entities.find((entity) => entity.kind === 'object');

    expect(object?.config).toEqual(manifest.objects[0]);
    expect(
      `${object?.defaultFolder}/${object?.fileBaseName}${object?.fileSuffix}`,
    ).toBe('src/objects/pet.object.ts');
  });

  it('should name a field on a standard object after that object', () => {
    const { entities } = buildPullEntities(buildManifest());
    const field = entities.find((entity) => entity.kind === 'field');

    expect(
      `${field?.defaultFolder}/${field?.fileBaseName}${field?.fileSuffix}`,
    ).toBe('src/fields/company-cared-for-pets.field.ts');
  });

  it('should name an index after its object and fields', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        indexes: [
          {
            universalIdentifier: INDEX_UID,
            objectUniversalIdentifier: PET_UID,
            fields: [{ fieldUniversalIdentifier: PET_NAME_FIELD_UID }],
          },
        ],
      } as unknown as Partial<Manifest>),
    );
    const index = entities.find((entity) => entity.kind === 'index');

    expect(
      `${index?.defaultFolder}/${index?.fileBaseName}${index?.fileSuffix}`,
    ).toBe('src/indexes/pet-name.index.ts');
  });

  it('should skip an object whose label identifier field is not part of the export', () => {
    const { entities, skipped } = buildPullEntities(
      buildManifest({
        objects: [
          {
            universalIdentifier: JUNCTION_UID,
            nameSingular: 'petCareAgreement',
            namePlural: 'petCareAgreements',
            labelSingular: 'Pet care agreement',
            labelPlural: 'Pet care agreements',
            labelIdentifierFieldMetadataUniversalIdentifier:
              JUNCTION_ID_FIELD_UID,
            fields: [
              {
                universalIdentifier: 'relation-field-uid',
                name: 'pet',
                label: 'Pet',
                type: 'RELATION',
              },
            ],
          },
        ],
      } as unknown as Partial<Manifest>),
    );

    expect(entities.some((entity) => entity.kind === 'object')).toBe(false);
    expect(skipped).toEqual([
      {
        kind: 'object',
        universalIdentifier: JUNCTION_UID,
        reason:
          'petCareAgreement: its label identifier field is engine-derived and not part of the export',
      },
    ]);
  });

  it('should skip an index whose object was skipped', () => {
    const { entities, skipped } = buildPullEntities(
      buildManifest({
        objects: [
          {
            universalIdentifier: JUNCTION_UID,
            nameSingular: 'petCareAgreement',
            namePlural: 'petCareAgreements',
            labelSingular: 'Pet care agreement',
            labelPlural: 'Pet care agreements',
            labelIdentifierFieldMetadataUniversalIdentifier:
              JUNCTION_ID_FIELD_UID,
            fields: [],
          },
        ],
        indexes: [
          {
            universalIdentifier: INDEX_UID,
            objectUniversalIdentifier: JUNCTION_UID,
            fields: [{ fieldUniversalIdentifier: 'unknown-field' }],
          },
        ],
      } as unknown as Partial<Manifest>),
    );

    expect(entities.some((entity) => entity.kind === 'index')).toBe(false);
    expect(
      skipped.find((entry) => entry.universalIdentifier === INDEX_UID)?.reason,
    ).toBe('its object is not part of the written source');
  });
});
