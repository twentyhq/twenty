import { getDefaultFieldsInObjectFields } from '@/cli/utilities/build/manifest/utils/get-default-fields-in-object-fields';
import { type ObjectConfig } from '@/sdk/define/objects/object-config';
import { getFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { describe, expect, it } from 'vitest';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const RELATION_FIELD_UID = '33333333-3333-4333-8333-333333333333';

const buildObjectConfig = (overrides: Partial<ObjectConfig>): ObjectConfig =>
  ({
    universalIdentifier: OBJECT_UID,
    nameSingular: 'petCareAgreement',
    namePlural: 'petCareAgreements',
    labelSingular: 'Pet care agreement',
    labelPlural: 'Pet care agreements',
    fields: [
      {
        universalIdentifier: RELATION_FIELD_UID,
        name: 'pet',
        label: 'Pet',
        type: FieldMetadataType.RELATION,
      },
    ],
    ...overrides,
  }) as unknown as ObjectConfig;

describe('getDefaultFieldsInObjectFields', () => {
  it('should append a name field when the object declares none', () => {
    const { objectFields } = getDefaultFieldsInObjectFields({
      objectConfig: buildObjectConfig({}),
      applicationUniversalIdentifier: APP_UID,
    });

    const nameField = objectFields.find((field) => field.name === 'name');

    expect(nameField?.universalIdentifier).toBe(
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP_UID,
        objectUniversalIdentifier: OBJECT_UID,
        name: 'name',
      }),
    );
  });

  it('should keep the name field the object declares itself', () => {
    const { objectFields } = getDefaultFieldsInObjectFields({
      objectConfig: buildObjectConfig({
        fields: [
          {
            universalIdentifier: 'a-hand-written-identifier',
            name: 'name',
            label: 'Name',
            type: FieldMetadataType.TEXT,
          },
        ],
      } as unknown as Partial<ObjectConfig>),
      applicationUniversalIdentifier: APP_UID,
    });

    expect(objectFields).toHaveLength(1);
    expect(objectFields[0].universalIdentifier).toBe(
      'a-hand-written-identifier',
    );
  });

  it('should not append a name field when the label identifier names an engine-derived field', () => {
    const { objectFields } = getDefaultFieldsInObjectFields({
      objectConfig: buildObjectConfig({
        labelIdentifierFieldMetadataUniversalIdentifier:
          getFieldUniversalIdentifier({
            applicationUniversalIdentifier: APP_UID,
            objectUniversalIdentifier: OBJECT_UID,
            name: 'id',
          }),
      }),
      applicationUniversalIdentifier: APP_UID,
    });

    expect(objectFields.map((field) => field.name)).toEqual(['pet']);
  });

  it('should still append a name field when the label identifier names one of its own fields', () => {
    const { objectFields } = getDefaultFieldsInObjectFields({
      objectConfig: buildObjectConfig({
        labelIdentifierFieldMetadataUniversalIdentifier: RELATION_FIELD_UID,
      }),
      applicationUniversalIdentifier: APP_UID,
    });

    expect(objectFields.map((field) => field.name)).toEqual(['pet', 'name']);
  });
});
