import { msg } from '@lingui/core/macro';

import { type WorkflowManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromWorkflowManifestToUniversalFlatWorkflowOrThrow } from 'src/engine/core-modules/application/application-manifest/converters/from-workflow-manifest-to-universal-flat-workflow-or-throw.util';
import { prepareWorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/utils/prepare-workflow-manifest-references.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

export const addWorkflowManifestsToFlatEntityMapsOrThrow = ({
  workflows,
  ownerFlatApplication,
  fromAllFlatEntityMaps,
  toAllUniversalFlatEntityMaps,
  existingAllFlatEntityMaps,
  isApplicationWorkflowsEnabled,
  inferDeletionFromMissingEntities,
  now,
}: {
  workflows: WorkflowManifest[];
  ownerFlatApplication: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  fromAllFlatEntityMaps: AllFlatEntityMaps;
  toAllUniversalFlatEntityMaps: AllFlatEntityMaps;
  existingAllFlatEntityMaps: AllFlatEntityMaps;
  isApplicationWorkflowsEnabled: boolean | undefined;
  inferDeletionFromMissingEntities: boolean;
  now: string;
}): void => {
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

  const declaredWorkflowIds = new Set(
    workflows.map((workflow) => workflow.universalIdentifier),
  );
  for (const existing of Object.values(
    fromAllFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier,
  )) {
    if (
      inferDeletionFromMissingEntities &&
      isDefined(existing) &&
      !isDefined(existing.workspaceWorkflowId) &&
      !declaredWorkflowIds.has(existing.universalIdentifier)
    ) {
      throw new ApplicationException(
        'Removing application workflows is not supported by the defineWorkflow POC; existing runs may still reference them',
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Removing application workflows is not supported yet.`,
        },
      );
    }
  }

  if (workflows.length > 0) {
    const references = prepareWorkflowManifestReferences({
      fromAllFlatEntityMaps,
      toAllUniversalFlatEntityMaps,
      existingAllFlatEntityMaps,
      ownerApplicationId: ownerFlatApplication.id,
    });
    const versionIdentifiersByWorkflowId = new Map<string, Set<string>>();
    for (const version of Object.values(
      fromAllFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(version) || !isDefined(version.coreWorkflowId)) {
        continue;
      }
      const identifiers =
        versionIdentifiersByWorkflowId.get(version.coreWorkflowId) ??
        new Set<string>();
      identifiers.add(version.universalIdentifier);
      versionIdentifiersByWorkflowId.set(version.coreWorkflowId, identifiers);
    }
    for (const workflowManifest of workflows) {
      const existingWorkflow =
        fromAllFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier[
          workflowManifest.universalIdentifier
        ];
      const existingVersion =
        fromAllFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier[
          workflowManifest.version.universalIdentifier
        ];
      const existingVersionIdentifiers = isDefined(existingWorkflow)
        ? versionIdentifiersByWorkflowId.get(existingWorkflow.id)
        : undefined;
      if (
        isDefined(existingVersionIdentifiers) &&
        (existingVersionIdentifiers.size !== 1 ||
          !existingVersionIdentifiers.has(
            workflowManifest.version.universalIdentifier,
          ))
      ) {
        throw new ApplicationException(
          'An application workflow must keep the same version universal identifier across updates',
          ApplicationExceptionCode.INVALID_INPUT,
          {
            userFriendlyMessage: msg`Keep the same workflow version universal identifier when updating an application.`,
          },
        );
      }
      const workflow = fromWorkflowManifestToUniversalFlatWorkflowOrThrow({
        manifest: workflowManifest,
        applicationUniversalIdentifier,
        existingWorkflow,
        existingVersion,
        ...references,
        now,
      });
      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: workflow,
        universalFlatEntityMapsToMutate:
          toAllUniversalFlatEntityMaps.flatWorkflowMaps,
      });
    }
  }
};
