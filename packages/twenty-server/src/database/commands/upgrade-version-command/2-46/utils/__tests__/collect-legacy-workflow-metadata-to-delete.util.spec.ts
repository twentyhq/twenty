import { FieldMetadataType } from 'twenty-shared/types';

import { collectLegacyWorkflowMetadataToDelete } from 'src/database/commands/upgrade-version-command/2-46/utils/collect-legacy-workflow-metadata-to-delete.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { type FlatIndexFieldMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-62be-406c-b9ca-8caa50d51392';
const WORKFLOW_RUN_WORKFLOW_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-8c57-4e7f-84f5-f373f68e1b82';

const toFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const buildFlatIndexFieldMetadata = (
  fieldMetadataId: string,
): FlatIndexFieldMetadata => ({
  id: `${fieldMetadataId}-index-field-id`,
  workspaceId: 'workspace-id',
  indexMetadataId: 'index-metadata-id',
  fieldMetadataId,
  order: 0,
  subFieldName: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const buildFieldWidget = ({
  universalIdentifier,
  objectMetadataId,
  fieldMetadataId,
}: {
  universalIdentifier: string;
  objectMetadataId: string;
  fieldMetadataId: string;
}): FlatPageLayoutWidget =>
  ({
    id: `${universalIdentifier}-id`,
    universalIdentifier,
    objectMetadataId,
    configuration: { configurationType: 'FIELD', fieldMetadataId },
  }) as unknown as FlatPageLayoutWidget;

const workflowNameField = getFlatFieldMetadataMock({
  universalIdentifier: 'workflow-name-field',
  objectMetadataId: 'workflow-object-id',
  type: FieldMetadataType.TEXT,
  name: 'name',
});

const workflowObject = getFlatObjectMetadataMock({
  id: 'workflow-object-id',
  universalIdentifier: WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'workflow',
  fieldIds: [workflowNameField.id],
});

const workflowRunWorkflowField = getFlatFieldMetadataMock({
  universalIdentifier: WORKFLOW_RUN_WORKFLOW_FIELD_UNIVERSAL_IDENTIFIER,
  objectMetadataId: 'workflow-run-object-id',
  type: FieldMetadataType.UUID,
  name: 'workflowId',
});

const workflowRunCoreWorkflowIdField = getFlatFieldMetadataMock({
  universalIdentifier: 'workflow-run-core-workflow-id-field',
  objectMetadataId: 'workflow-run-object-id',
  type: FieldMetadataType.UUID,
  name: 'coreWorkflowId',
});

const workflowRunObject = getFlatObjectMetadataMock({
  id: 'workflow-run-object-id',
  universalIdentifier: 'workflow-run-object',
  nameSingular: 'workflowRun',
  fieldIds: [workflowRunWorkflowField.id, workflowRunCoreWorkflowIdField.id],
});

const workflowRunWorkflowIndex = getFlatIndexMetadataMock({
  universalIdentifier: 'workflow-run-workflow-index',
  objectMetadataId: workflowRunObject.id,
  objectMetadataUniversalIdentifier: workflowRunObject.universalIdentifier,
  applicationUniversalIdentifier: 'application',
  flatIndexFieldMetadatas: [
    buildFlatIndexFieldMetadata(workflowRunWorkflowField.id),
  ],
});

const workflowRunCoreWorkflowIndex = getFlatIndexMetadataMock({
  universalIdentifier: 'workflow-run-core-workflow-index',
  objectMetadataId: workflowRunObject.id,
  objectMetadataUniversalIdentifier: workflowRunObject.universalIdentifier,
  applicationUniversalIdentifier: 'application',
  flatIndexFieldMetadatas: [
    buildFlatIndexFieldMetadata(workflowRunCoreWorkflowIdField.id),
  ],
});

const workflowRunWorkflowWidget = buildFieldWidget({
  universalIdentifier: 'workflow-run-workflow-widget',
  objectMetadataId: workflowRunObject.id,
  fieldMetadataId: workflowRunWorkflowField.id,
});

const workflowRunCoreWorkflowWidget = buildFieldWidget({
  universalIdentifier: 'workflow-run-core-workflow-widget',
  objectMetadataId: workflowRunObject.id,
  fieldMetadataId: workflowRunCoreWorkflowIdField.id,
});

const workflowNameWidget = buildFieldWidget({
  universalIdentifier: 'workflow-name-widget',
  objectMetadataId: workflowObject.id,
  fieldMetadataId: workflowNameField.id,
});

const collect = () =>
  collectLegacyWorkflowMetadataToDelete({
    flatObjectMetadataMaps: toFlatEntityMaps([
      workflowObject,
      workflowRunObject,
    ]),
    flatFieldMetadataMaps: toFlatEntityMaps([
      workflowNameField,
      workflowRunWorkflowField,
      workflowRunCoreWorkflowIdField,
    ]),
    flatIndexMaps: toFlatEntityMaps([
      workflowRunWorkflowIndex,
      workflowRunCoreWorkflowIndex,
    ]),
    flatPageLayoutWidgetMaps: toFlatEntityMaps([
      workflowRunWorkflowWidget,
      workflowRunCoreWorkflowWidget,
      workflowNameWidget,
    ]),
  });

describe('collectLegacyWorkflowMetadataToDelete', () => {
  it('collects the legacy objects that still exist', () => {
    expect(collect().flatObjectMetadatasToDelete.map(({ id }) => id)).toEqual([
      workflowObject.id,
    ]);
  });

  it('collects the legacy objects fields and the relation fields pointing at them', () => {
    expect(
      collect()
        .flatFieldMetadatasToDelete.map(
          ({ universalIdentifier }) => universalIdentifier,
        )
        .sort(),
    ).toEqual(
      [
        workflowNameField.universalIdentifier,
        WORKFLOW_RUN_WORKFLOW_FIELD_UNIVERSAL_IDENTIFIER,
      ].sort(),
    );
  });

  it('keeps the core id fields of runs and their indexes', () => {
    const { flatFieldMetadatasToDelete, flatIndexMetadatasToDelete } =
      collect();

    expect(
      flatFieldMetadatasToDelete.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).not.toContain(workflowRunCoreWorkflowIdField.universalIdentifier);
    expect(
      flatIndexMetadatasToDelete.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).toEqual([workflowRunWorkflowIndex.universalIdentifier]);
  });

  it('drops field widgets of surviving objects that show a deleted field', () => {
    expect(
      collect().flatPageLayoutWidgetsToDelete.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).toEqual([workflowRunWorkflowWidget.universalIdentifier]);
  });

  it('collects nothing once the legacy objects are gone', () => {
    expect(
      collectLegacyWorkflowMetadataToDelete({
        flatObjectMetadataMaps: toFlatEntityMaps([workflowRunObject]),
        flatFieldMetadataMaps: toFlatEntityMaps([
          workflowRunCoreWorkflowIdField,
        ]),
        flatIndexMaps: toFlatEntityMaps([workflowRunCoreWorkflowIndex]),
        flatPageLayoutWidgetMaps: toFlatEntityMaps([
          workflowRunCoreWorkflowWidget,
        ]),
      }),
    ).toEqual({
      flatObjectMetadatasToDelete: [],
      flatFieldMetadatasToDelete: [],
      flatIndexMetadatasToDelete: [],
      flatPageLayoutWidgetsToDelete: [],
    });
  });
});
