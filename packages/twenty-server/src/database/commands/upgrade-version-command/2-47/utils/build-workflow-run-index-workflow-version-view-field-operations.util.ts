import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

const WORKFLOW_RUN_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.views.allWorkflowRuns.universalIdentifier;

const WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.fields.workflowVersion.universalIdentifier;

export type WorkflowRunIndexWorkflowVersionViewFieldFlatMaps = Pick<
  AllFlatEntityMaps,
  'flatViewMaps' | 'flatViewFieldMaps' | 'flatFieldMetadataMaps'
>;

export type WorkflowRunIndexWorkflowVersionViewFieldOperations = {
  viewFieldsToCreate: FlatViewField[];
  viewFieldsToDelete: FlatViewField[];
};

export const buildWorkflowRunIndexWorkflowVersionViewFieldOperations = ({
  flatMaps: { flatViewMaps, flatViewFieldMaps, flatFieldMetadataMaps },
  now,
  direction,
}: {
  flatMaps: WorkflowRunIndexWorkflowVersionViewFieldFlatMaps;
  now: string;
  direction: 'up' | 'down';
}): WorkflowRunIndexWorkflowVersionViewFieldOperations => {
  const flatView =
    flatViewMaps.byUniversalIdentifier[
      WORKFLOW_RUN_INDEX_VIEW_UNIVERSAL_IDENTIFIER
    ];

  if (!isDefined(flatView)) {
    return { viewFieldsToCreate: [], viewFieldsToDelete: [] };
  }

  const flatViewFields =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatViewFieldMaps,
      universalIdentifiers: flatView.viewFieldUniversalIdentifiers,
    });

  const workflowVersionViewFields = flatViewFields.filter(
    (flatViewField) =>
      flatViewField.fieldMetadataUniversalIdentifier ===
      WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER,
  );

  if (direction === 'up') {
    return {
      viewFieldsToCreate: [],
      viewFieldsToDelete: workflowVersionViewFields,
    };
  }

  const workflowVersionField =
    flatFieldMetadataMaps.byUniversalIdentifier[
      WORKFLOW_VERSION_FIELD_UNIVERSAL_IDENTIFIER
    ];

  if (
    workflowVersionViewFields.length > 0 ||
    !isDefined(workflowVersionField)
  ) {
    return { viewFieldsToCreate: [], viewFieldsToDelete: [] };
  }

  return {
    viewFieldsToCreate: [
      {
        id: v4(),
        universalIdentifier: getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            workflowVersionField.applicationUniversalIdentifier,
          viewUniversalIdentifier: flatView.universalIdentifier,
          fieldMetadataUniversalIdentifier:
            workflowVersionField.universalIdentifier,
        }),
        applicationId: workflowVersionField.applicationId,
        applicationUniversalIdentifier:
          workflowVersionField.applicationUniversalIdentifier,
        workspaceId: flatView.workspaceId,
        viewId: flatView.id,
        viewUniversalIdentifier: flatView.universalIdentifier,
        fieldMetadataId: workflowVersionField.id,
        fieldMetadataUniversalIdentifier:
          workflowVersionField.universalIdentifier,
        viewFieldGroupId: null,
        viewFieldGroupUniversalIdentifier: null,
        position:
          Math.max(-1, ...flatViewFields.map(({ position }) => position)) + 1,
        isVisible: true,
        size: 150,
        aggregateOperation: null,
        isActive: true,
        isSystemSideEffect: flatView.isSystemSideEffect,
        overrides: null,
        universalOverrides: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
    ],
    viewFieldsToDelete: [],
  };
};
