import { msg } from '@lingui/core/macro';

import {
  getWorkflowVersionUniversalIdentifier,
  type WorkflowManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromWorkflowManifestToUniversalFlatWorkflowOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-workflow-or-throw.util';
import { type WorkflowManifestConnectedAccountReference } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { findActiveFlatWorkflowVersionByWorkflowId } from 'src/engine/core-modules/application/application-manifest/utils/find-active-flat-workflow-version-by-workflow-id.util';
import { prepareWorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/utils/prepare-workflow-manifest-references.util';
import { validateWorkflowManifestRecordFields } from 'src/engine/core-modules/application/application-manifest/utils/validate-workflow-manifest-record-fields.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type UniversalFlatWorkflow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow.type';
import { type IdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

// The workspace custom application publishes from the active version, not a managed one
const findManagedFlatWorkflowVersion = ({
  flatWorkflowVersionMaps,
  applicationUniversalIdentifier,
  workflowUniversalIdentifier,
  isWorkspaceCustomApplication,
}: {
  flatWorkflowVersionMaps: AllFlatEntityMaps['flatWorkflowVersionMaps'];
  applicationUniversalIdentifier: string;
  workflowUniversalIdentifier: string;
  isWorkspaceCustomApplication: boolean;
}): FlatWorkflowVersion | undefined => {
  if (isWorkspaceCustomApplication) {
    return undefined;
  }

  return flatWorkflowVersionMaps.byUniversalIdentifier[
    getWorkflowVersionUniversalIdentifier({
      applicationUniversalIdentifier,
      workflowUniversalIdentifier,
    })
  ];
};

export const addWorkflowManifestsToFlatEntityMapsOrThrow = ({
  workflows,
  ownerFlatApplication,
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  existingAllFlatEntityMaps,
  idByUniversalIdentifierByMetadataName,
  isWorkspaceCustomApplication,
  connectedAccounts,
  now,
}: {
  workflows: WorkflowManifest[];
  ownerFlatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
  isWorkspaceCustomApplication: boolean;
  connectedAccounts: readonly WorkflowManifestConnectedAccountReference[];
  now: string;
}): (UniversalFlatWorkflow & { id: string })[] => {
  const applicationUniversalIdentifier =
    ownerFlatApplication.universalIdentifier;
  const applicationWorkflows: (UniversalFlatWorkflow & { id: string })[] = [];

  if (workflows.length > 0) {
    const references = {
      ...prepareWorkflowManifestReferences({
        toAllUniversalFlatEntityMaps,
        existingAllFlatEntityMaps,
        ownerApplicationId: ownerFlatApplication.id,
        idByUniversalIdentifierByMetadataName,
        // Its workflows run as workspace workflows, which may already call any app's actions
        canReferenceOtherApplicationsWorkflowActions:
          isWorkspaceCustomApplication,
      }),
      connectedAccounts,
    };
    const activeVersionByWorkflowId = isWorkspaceCustomApplication
      ? findActiveFlatWorkflowVersionByWorkflowId(
          fromAllFlatEntityMaps.flatWorkflowVersionMaps,
        )
      : new Map<string, FlatWorkflowVersion>();
    const recordFieldErrors: string[] = [];
    for (const workflowManifest of workflows) {
      const existingWorkflow =
        fromAllFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier[
          workflowManifest.universalIdentifier
        ];
      const existingVersion = findManagedFlatWorkflowVersion({
        flatWorkflowVersionMaps: fromAllFlatEntityMaps.flatWorkflowVersionMaps,
        applicationUniversalIdentifier,
        workflowUniversalIdentifier: workflowManifest.universalIdentifier,
        isWorkspaceCustomApplication,
      });
      const workflow = fromWorkflowManifestToUniversalFlatWorkflowOrThrow({
        manifest: workflowManifest,
        applicationUniversalIdentifier,
        existingWorkflow,
        existingVersion,
        activeVersion: isDefined(existingWorkflow)
          ? activeVersionByWorkflowId.get(existingWorkflow.id)
          : undefined,
        isWorkspaceCustomApplication,
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
