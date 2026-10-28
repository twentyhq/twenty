import {
  getWorkflowVersionUniversalIdentifier,
  type WorkflowManifest,
} from 'twenty-shared/application';
import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WORKFLOW_CHANGED_IN_BUILDER_REASON } from 'src/engine/core-modules/application/application-manifest/constants/workflow-changed-in-builder-reason.constant';
import { fromFlatWorkflowToWorkflowManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-workflow-to-workflow-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { type WorkflowManifestConnectedAccountReference } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { buildWorkflowManifestExportReferences } from 'src/engine/core-modules/application/application-manifest/utils/build-workflow-manifest-export-references.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

type ExportedFlatWorkflow = Pick<
  FlatWorkflow,
  | 'applicationUniversalIdentifier'
  | 'universalIdentifier'
  | 'lastPublishedCoreWorkflowVersionId'
>;

// The builder publishes workspace custom application workflows too, under any version identifier
const findPublishedFlatWorkflowVersionCandidate = ({
  flatWorkflow,
  lastPublishedCoreWorkflowVersionId,
  flatWorkflowVersionMaps,
  isWorkspaceCustomApplication,
}: {
  flatWorkflow: ExportedFlatWorkflow;
  lastPublishedCoreWorkflowVersionId: string;
  flatWorkflowVersionMaps: AllFlatEntityMaps['flatWorkflowVersionMaps'];
  isWorkspaceCustomApplication: boolean;
}): FlatWorkflowVersion | undefined => {
  if (isWorkspaceCustomApplication) {
    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: lastPublishedCoreWorkflowVersionId,
      flatEntityMaps: flatWorkflowVersionMaps,
    });
  }

  return flatWorkflowVersionMaps.byUniversalIdentifier[
    getWorkflowVersionUniversalIdentifier({
      applicationUniversalIdentifier:
        flatWorkflow.applicationUniversalIdentifier,
      workflowUniversalIdentifier: flatWorkflow.universalIdentifier,
    })
  ];
};

const findExportedFlatWorkflowVersion = ({
  flatWorkflow,
  allFlatEntityMaps: { flatWorkflowVersionMaps },
  isWorkspaceCustomApplication,
}: {
  flatWorkflow: ExportedFlatWorkflow;
  allFlatEntityMaps: Pick<AllFlatEntityMaps, 'flatWorkflowVersionMaps'>;
  isWorkspaceCustomApplication: boolean;
}): FlatWorkflowVersion | undefined => {
  const { lastPublishedCoreWorkflowVersionId } = flatWorkflow;

  if (!isDefined(lastPublishedCoreWorkflowVersionId)) {
    return undefined;
  }

  const flatWorkflowVersion = findPublishedFlatWorkflowVersionCandidate({
    flatWorkflow,
    lastPublishedCoreWorkflowVersionId,
    flatWorkflowVersionMaps,
    isWorkspaceCustomApplication,
  });

  return isDefined(flatWorkflowVersion) &&
    flatWorkflowVersion.status === WorkflowVersionStatus.ACTIVE &&
    flatWorkflowVersion.id === lastPublishedCoreWorkflowVersionId
    ? flatWorkflowVersion
    : undefined;
};

export const reconstructWorkflowsManifest = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
  resolvableFieldUniversalIdentifiers,
  isWorkspaceCustomApplication,
  connectedAccounts,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
  resolvableFieldUniversalIdentifiers: ReadonlySet<string>;
  isWorkspaceCustomApplication: boolean;
  connectedAccounts: readonly WorkflowManifestConnectedAccountReference[];
}): {
  workflows: WorkflowManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const workflows: WorkflowManifest[] = [];
  const coverage: ApplicationExportCoverageEntry[] = [];
  const references = {
    ...buildWorkflowManifestExportReferences({
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers,
      resolvableFieldUniversalIdentifiers,
      canReferenceOtherApplicationsWorkflowActions:
        isWorkspaceCustomApplication,
    }),
    connectedAccounts,
  };

  const getExclusionReason = (flatWorkflow: FlatWorkflow) => {
    if (flatWorkflow.isSystem) {
      return 'system workflow';
    }

    return flatWorkflow.visibility === WorkflowVisibility.PRIVATE
      ? 'private workflow'
      : undefined;
  };

  const convertFlatWorkflow = (
    flatWorkflow: FlatWorkflow,
  ): { manifest: WorkflowManifest } | { reason: string } => {
    const flatWorkflowVersion = findExportedFlatWorkflowVersion({
      flatWorkflow,
      allFlatEntityMaps,
      isWorkspaceCustomApplication,
    });

    if (!isDefined(flatWorkflowVersion)) {
      return {
        reason: isWorkspaceCustomApplication
          ? 'workflow without an active version'
          : WORKFLOW_CHANGED_IN_BUILDER_REASON,
      };
    }

    return fromFlatWorkflowToWorkflowManifest({
      flatWorkflow,
      flatWorkflowVersion,
      references,
      ...(isWorkspaceCustomApplication
        ? {
            unreproducibleReason:
              'workflow with settings a manifest cannot reproduce',
          }
        : {}),
    });
  };

  for (const flatWorkflow of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatWorkflowMaps,
  )) {
    const { universalIdentifier } = flatWorkflow;
    const exclusionReason = getExclusionReason(flatWorkflow);

    if (isDefined(exclusionReason)) {
      coverage.push({
        metadataName: 'workflow',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.EXCLUDED,
        reason: exclusionReason,
      });
      continue;
    }

    const conversion = convertFlatWorkflow(flatWorkflow);

    if ('reason' in conversion) {
      coverage.push({
        metadataName: 'workflow',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: conversion.reason,
      });
      continue;
    }

    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'workflow',
        flatEntity: flatWorkflow,
      }),
    );
    workflows.push(conversion.manifest);
  }

  return { workflows, coverage };
};
