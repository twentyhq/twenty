import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildMissingMorphRelationHeads } from 'src/database/commands/upgrade-version-command/2-48/utils/build-missing-morph-relation-heads.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const MORPH_ID = 'morph-id';

const toMaps = <TEntity extends { universalIdentifier: string }>(
  entities: TEntity[],
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.universalIdentifier, entity]),
    ),
  }) as unknown as FlatEntityMaps<TEntity & FlatFieldMetadata> &
    FlatEntityMaps<TEntity & FlatObjectMetadata>;

const makeObject = ({
  universalIdentifier,
  nameSingular,
  fieldUniversalIdentifiers = [],
}: {
  universalIdentifier: string;
  nameSingular: string;
  fieldUniversalIdentifiers?: string[];
}) =>
  ({
    universalIdentifier,
    nameSingular,
    namePlural: `${nameSingular}s`,
    fieldUniversalIdentifiers,
  }) as FlatObjectMetadata;

const makeTarget = ({
  universalIdentifier,
  name,
  objectMetadataUniversalIdentifier,
  relationTargetObjectMetadataUniversalIdentifier,
}: {
  universalIdentifier: string;
  name: string;
  objectMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier: string;
}) =>
  ({
    id: `${universalIdentifier}-id`,
    universalIdentifier,
    name,
    type: FieldMetadataType.MORPH_RELATION,
    morphId: MORPH_ID,
    objectMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier: `${universalIdentifier}-inverse`,
    applicationUniversalIdentifier: 'application',
    universalSettings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: `${name}Id`,
    },
  }) as unknown as FlatFieldMetadata;

const PET = makeObject({ universalIdentifier: 'pet', nameSingular: 'pet' });
const TOY = makeObject({ universalIdentifier: 'toy', nameSingular: 'toy' });

const OWNER_PET = makeTarget({
  universalIdentifier: 'owner-pet',
  name: 'ownerPet',
  objectMetadataUniversalIdentifier: 'source',
  relationTargetObjectMetadataUniversalIdentifier: 'pet',
});
const OWNER_TOY = makeTarget({
  universalIdentifier: 'owner-toy',
  name: 'ownerToy',
  objectMetadataUniversalIdentifier: 'source',
  relationTargetObjectMetadataUniversalIdentifier: 'toy',
});

const build = ({
  fields,
  sourceFieldUniversalIdentifiers,
}: {
  fields: FlatFieldMetadata[];
  sourceFieldUniversalIdentifiers: string[];
}) =>
  buildMissingMorphRelationHeads({
    flatFieldMetadataMaps: toMaps(fields),
    flatObjectMetadataMaps: toMaps([
      PET,
      TOY,
      makeObject({
        universalIdentifier: 'source',
        nameSingular: 'source',
        fieldUniversalIdentifiers: sourceFieldUniversalIdentifiers,
      }),
    ]),
    standardFlatFieldMetadataMaps: toMaps<FlatFieldMetadata>([]),
  });

describe('buildMissingMorphRelationHeads', () => {
  it('builds one head named after the morph field', () => {
    const { heads, skipped } = build({
      fields: [OWNER_TOY, OWNER_PET],
      sourceFieldUniversalIdentifiers: ['owner-pet', 'owner-toy'],
    });

    expect(skipped).toEqual([]);
    expect(heads).toHaveLength(1);
    expect(heads[0]).toMatchObject({
      universalIdentifier: MORPH_ID,
      morphId: MORPH_ID,
      name: 'owner',
      isSystemSideEffect: true,
      relationTargetObjectMetadataUniversalIdentifier: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
      universalSettings: { relationType: RelationType.MANY_TO_ONE },
    });
    expect(heads[0]).not.toHaveProperty('id');
    expect(heads[0].universalSettings).not.toHaveProperty('joinColumnName');
  });

  it('skips a morph relation that already has a head', () => {
    const head = {
      ...OWNER_PET,
      universalIdentifier: MORPH_ID,
      name: 'owner',
    } as FlatFieldMetadata;

    expect(
      build({
        fields: [OWNER_PET, head],
        sourceFieldUniversalIdentifiers: ['owner-pet', MORPH_ID],
      }),
    ).toEqual({ heads: [], skipped: [] });
  });

  it('skips a morph relation whose name is taken on its object', () => {
    const ownerTextField = {
      universalIdentifier: 'owner-text',
      name: 'owner',
      type: FieldMetadataType.TEXT,
    } as FlatFieldMetadata;

    expect(
      build({
        fields: [OWNER_PET, ownerTextField],
        sourceFieldUniversalIdentifiers: ['owner-pet', 'owner-text'],
      }),
    ).toEqual({
      heads: [],
      skipped: [
        { morphId: MORPH_ID, reason: 'name "owner" is taken on its object' },
      ],
    });
  });

  it('skips a morph id shared by targets on several objects', () => {
    const otherObjectTarget = {
      ...OWNER_TOY,
      objectMetadataUniversalIdentifier: 'pet',
    } as FlatFieldMetadata;

    expect(
      build({
        fields: [OWNER_PET, otherObjectTarget],
        sourceFieldUniversalIdentifiers: ['owner-pet'],
      }),
    ).toEqual({
      heads: [],
      skipped: [{ morphId: MORPH_ID, reason: 'targets span 2 objects' }],
    });
  });
});
