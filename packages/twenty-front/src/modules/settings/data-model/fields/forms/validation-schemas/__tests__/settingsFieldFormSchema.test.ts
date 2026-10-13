import { settingsFieldFormSchema } from '@/settings/data-model/fields/forms/validation-schemas/settingsFieldFormSchema';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const SOURCE_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000001';
const DESTINATION_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000002';

const buildMorphRelationFormValues = (
  morphRelationObjectMetadataIds: string[],
) => ({
  type: FieldMetadataType.MORPH_RELATION,
  label: 'Related to',
  icon: 'IconLink',
  description: null,
  isLabelSyncedWithName: false,
  morphRelationObjectMetadataIds,
  relationType: RelationType.MANY_TO_ONE,
  targetFieldLabel: 'Related records',
  iconOnDestination: 'IconBuilding',
});

describe('settingsFieldFormSchema', () => {
  it('requires a destination when creating a relation', () => {
    const schema = settingsFieldFormSchema({
      sourceObjectMetadataId: SOURCE_OBJECT_METADATA_ID,
      isRelationDestinationRequired: true,
    });

    expect(schema.safeParse(buildMorphRelationFormValues([])).success).toBe(
      false,
    );
    expect(
      schema.safeParse(
        buildMorphRelationFormValues([DESTINATION_OBJECT_METADATA_ID]),
      ).success,
    ).toBe(true);
  });

  it('keeps a morph field without destinations editable', () => {
    const schema = settingsFieldFormSchema({
      sourceObjectMetadataId: SOURCE_OBJECT_METADATA_ID,
    });

    expect(schema.safeParse(buildMorphRelationFormValues([])).success).toBe(
      true,
    );
  });

  it('rejects the source object among several destinations', () => {
    const schema = settingsFieldFormSchema({
      sourceObjectMetadataId: SOURCE_OBJECT_METADATA_ID,
    });

    expect(
      schema.safeParse(
        buildMorphRelationFormValues([
          DESTINATION_OBJECT_METADATA_ID,
          SOURCE_OBJECT_METADATA_ID,
        ]),
      ).success,
    ).toBe(false);
  });
});
