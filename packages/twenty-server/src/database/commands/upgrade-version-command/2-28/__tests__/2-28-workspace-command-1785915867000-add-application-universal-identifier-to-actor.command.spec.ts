import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  buildActorApplicationUniversalIdentifierColumnTargets,
  buildAddActorApplicationUniversalIdentifierColumnsSql,
} from 'src/database/commands/upgrade-version-command/2-28/2-28-workspace-command-1785915867000-add-application-universal-identifier-to-actor.command';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('add application universal identifier to actor workspace command', () => {
  it('builds one nullable UUID column target for every local ACTOR field', () => {
    const personObject = {
      id: 'person-id',
      universalIdentifier: 'person-universal-identifier',
      nameSingular: 'person',
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      isRemote: false,
    } as FlatObjectMetadata;
    const remoteObject = {
      id: 'remote-id',
      universalIdentifier: 'remote-universal-identifier',
      nameSingular: 'remotePerson',
      applicationUniversalIdentifier: '22222222-2222-4222-8222-222222222222',
      isRemote: true,
    } as FlatObjectMetadata;
    const flatFieldMetadataItems = [
      {
        id: 'created-by-id',
        universalIdentifier: 'created-by-universal-identifier',
        name: 'createdBy',
        type: FieldMetadataType.ACTOR,
        objectMetadataUniversalIdentifier: personObject.universalIdentifier,
      },
      {
        id: 'updated-by-id',
        universalIdentifier: 'updated-by-universal-identifier',
        name: 'updatedBy',
        type: FieldMetadataType.ACTOR,
        objectMetadataUniversalIdentifier: personObject.universalIdentifier,
      },
      {
        id: 'name-id',
        universalIdentifier: 'name-universal-identifier',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataUniversalIdentifier: personObject.universalIdentifier,
      },
      {
        id: 'remote-created-by-id',
        universalIdentifier: 'remote-created-by-universal-identifier',
        name: 'createdBy',
        type: FieldMetadataType.ACTOR,
        objectMetadataUniversalIdentifier: remoteObject.universalIdentifier,
      },
    ] as FlatFieldMetadata[];

    expect(
      buildActorApplicationUniversalIdentifierColumnTargets({
        flatObjectMetadataMaps: buildFlatEntityMaps([
          personObject,
          remoteObject,
        ]),
        flatFieldMetadataMaps: buildFlatEntityMaps(flatFieldMetadataItems),
      }),
    ).toEqual([
      {
        tableName: 'person',
        columnNames: [
          'createdByApplicationUniversalIdentifier',
          'updatedByApplicationUniversalIdentifier',
        ],
      },
    ]);
  });

  it('builds idempotent DDL without a default or row backfill', () => {
    const sql = buildAddActorApplicationUniversalIdentifierColumnsSql({
      schemaName: 'workspace_test',
      actorApplicationUniversalIdentifierColumnTarget: {
        tableName: 'person',
        columnNames: ['createdByApplicationUniversalIdentifier'],
      },
    });

    expect(sql).toBe(
      'ALTER TABLE "workspace_test"."person" ADD COLUMN IF NOT EXISTS "createdByApplicationUniversalIdentifier" uuid',
    );
    expect(sql).not.toContain('DEFAULT');
    expect(sql).not.toContain('NOT NULL');
    expect(sql).not.toContain('UPDATE');
  });
});
