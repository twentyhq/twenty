import { msg } from '@lingui/core/macro';

import {
  getWorkflowVersionUniversalIdentifier,
  type WorkflowManifest,
} from 'twenty-shared/application';

import { fromWorkflowManifestToUniversalFlatWorkflowOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-workflow-or-throw.util';
import { prepareWorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/utils/prepare-workflow-manifest-references.util';
import { validateWorkflowManifestRecordFields } from 'src/engine/core-modules/application/application-manifest/utils/validate-workflow-manifest-record-fields.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type IdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

export const addWorkflowManifestsToFlatEntityMapsOrThrow = ({
  workflows,
  ownerFlatApplication,
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  existingAllFlatEntityMaps,
  idByUniversalIdentifierByMetadataName,
  isApplicationWorkflowsEnabled,
  now,
}: {
  workflows: WorkflowManifest[];
  ownerFlatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
  isApplicationWorkflowsEnabled: boolean | undefined;
  now: string;
}): (UniversalFlatWorkflow & { id: string })[] => {
  if (workflows.length > 0 && !isApplicationWorkflowsEnabled) {
    throw new ApplicationException(
      'Application workflows are not enabled for this workspace',
      ApplicationExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: msg`Application workflows are not enabled for this workspace.`,
      },
    );
  }

  const applicationUniversalIdentifier =
    ownerFlatApplication.universalIdentifier;
  const applicationWorkflows: (UniversalFlatWorkflow & { id: string })[] = [];

  if (workflows.length > 0) {
    const references = prepareWorkflowManifestReferences({
      toAllUniversalFlatEntityMaps,
      existingAllFlatEntityMaps,
      ownerApplicationId: ownerFlatApplication.id,
      idByUniversalIdentifierByMetadataName,
    });
    const recordFieldErrors: string[] = [];
    for (const workflowManifest of workflows) {
      const existingWorkflow =
        fromAllFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier[
          workflowManifest.universalIdentifier
        ];
      const existingVersion =
        fromAllFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
          getWorkflowVersionUniversalIdentifier({
            applicationUniversalIdentifier,
            workflowUniversalIdentifier: workflowManifest.universalIdentifier,
          })
        ];
      const workflow = fromWorkflowManifestToUniversalFlatWorkflowOrThrow({
        manifest: workflowManifest,
        applicationUniversalIdentifier,
        existingWorkflow,
        existingVersion,
        ...references,
        now,
      });
      recordFieldErrors.push(
        ...validateWorkflowManifestRecordFields({
          steps: workflow.flatUniversalWorkflowVersion?.steps ?? [],
          objectByUniversalIdentifier: references.objectByUniversalIdentifier,
          fieldByUniversalIdentifier: references.fieldByUniversalIdentifier,
        }),
      );
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: workflow,
        universalFlatEntityMapsToMutate:
          toAllUniversalFlatEntityMaps.flatWorkflowMaps,
      });
      applicationWorkflows.push(workflow);
    }
    if (recordFieldErrors.length > 0) {
      throw new ApplicationException(
        `Invalid application workflow definition: ${recordFieldErrors.join('; ')}`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`The application workflow definition is invalid.`,
        },
      );
    }
  }

  return applicationWorkflows;
};
