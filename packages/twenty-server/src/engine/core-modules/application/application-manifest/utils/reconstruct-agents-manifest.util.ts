import { type AgentManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromAgentManifestToUniversalFlatRoleTarget } from 'src/engine/core-modules/application/application-manifest/converters/from-agent-manifest-to-universal-flat-role-target.util';
import { fromFlatAgentToAgentManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-agent-to-agent-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { getUnreproducedPropertiesReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unreproduced-properties-reason.util';
import { getUnresolvableReferenceReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-reference-reason.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { fromAgentManifestToUniversalFlatAgent } from 'src/engine/core-modules/application/utils/from-agent-manifest-to-universal-flat-agent.util';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export const reconstructAgentsManifest = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  resolvableRoleUniversalIdentifiers,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  resolvableRoleUniversalIdentifiers: ReadonlySet<string>;
}): {
  agents: AgentManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const agents: AgentManifest[] = [];
  const coverage: ApplicationExportCoverageEntry[] = [];
  const flatRoleTargetsByAgentUniversalIdentifier = new Map<
    string,
    FlatRoleTarget[]
  >();

  for (const flatRoleTarget of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatRoleTargetMaps,
  )) {
    const { agentUniversalIdentifier } = flatRoleTarget;

    if (isDefined(agentUniversalIdentifier)) {
      flatRoleTargetsByAgentUniversalIdentifier.set(agentUniversalIdentifier, [
        ...(flatRoleTargetsByAgentUniversalIdentifier.get(
          agentUniversalIdentifier,
        ) ?? []),
        flatRoleTarget,
      ]);
    }
  }

  const convertFlatAgent = ({
    flatAgent,
    flatRoleTargets,
  }: {
    flatAgent: FlatAgent;
    flatRoleTargets: FlatRoleTarget[];
  }): { manifest: AgentManifest } | { reason: string } => {
    if (flatRoleTargets.length > 1) {
      return { reason: 'agent with more than one role' };
    }

    const [flatRoleTarget] = flatRoleTargets;
    const unresolvableRoleReason = getUnresolvableReferenceReason({
      metadataName: 'agent',
      referenceMetadataName: 'role',
      referenceUniversalIdentifier: flatRoleTarget?.roleUniversalIdentifier,
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      resolvableReferenceUniversalIdentifiers:
        resolvableRoleUniversalIdentifiers,
    });

    if (isDefined(unresolvableRoleReason)) {
      return { reason: unresolvableRoleReason };
    }

    const manifest = fromFlatAgentToAgentManifest({
      flatAgent,
      roleUniversalIdentifier: flatRoleTarget?.roleUniversalIdentifier,
    });
    const reproduction = {
      applicationUniversalIdentifier: flatAgent.applicationUniversalIdentifier,
      now: flatAgent.updatedAt,
    };
    const unreproducedAgentReason = getUnreproducedPropertiesReason({
      metadataName: 'agent',
      flatEntity: flatAgent,
      reproducedUniversalFlatEntity: fromAgentManifestToUniversalFlatAgent({
        agentManifest: manifest,
        ...reproduction,
      }),
    });

    if (isDefined(unreproducedAgentReason)) {
      return { reason: unreproducedAgentReason };
    }

    if (!isDefined(flatRoleTarget)) {
      return { manifest };
    }

    const reproducedFlatRoleTarget = fromAgentManifestToUniversalFlatRoleTarget(
      {
        agentUniversalIdentifier: flatAgent.universalIdentifier,
        roleUniversalIdentifier: flatRoleTarget.roleUniversalIdentifier,
        ...reproduction,
      },
    );

    if (
      reproducedFlatRoleTarget.universalIdentifier !==
      flatRoleTarget.universalIdentifier
    ) {
      return { reason: 'agent whose role was assigned outside its definition' };
    }

    const unreproducedRoleTargetReason = getUnreproducedPropertiesReason({
      metadataName: 'roleTarget',
      flatEntity: flatRoleTarget,
      reproducedUniversalFlatEntity: reproducedFlatRoleTarget,
    });

    return isDefined(unreproducedRoleTargetReason)
      ? { reason: unreproducedRoleTargetReason }
      : { manifest };
  };

  const exportedAgentUniversalIdentifiers = new Set<string>();

  for (const flatAgent of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatAgentMaps,
  )) {
    // Left to the classifier, which reports soft-deleted entities as excluded
    if (isDefined(flatAgent.deletedAt)) {
      continue;
    }

    const conversion = convertFlatAgent({
      flatAgent,
      flatRoleTargets:
        flatRoleTargetsByAgentUniversalIdentifier.get(
          flatAgent.universalIdentifier,
        ) ?? [],
    });

    if ('reason' in conversion) {
      coverage.push({
        metadataName: 'agent',
        universalIdentifier: flatAgent.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: conversion.reason,
      });
      continue;
    }

    exportedAgentUniversalIdentifiers.add(flatAgent.universalIdentifier);
    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'agent',
        flatEntity: flatAgent,
      }),
    );
    agents.push(conversion.manifest);
  }

  for (const [
    agentUniversalIdentifier,
    flatRoleTargets,
  ] of flatRoleTargetsByAgentUniversalIdentifier) {
    for (const flatRoleTarget of flatRoleTargets) {
      if (exportedAgentUniversalIdentifiers.has(agentUniversalIdentifier)) {
        coverage.push(
          buildExportedCoverageEntry({
            metadataName: 'roleTarget',
            flatEntity: flatRoleTarget,
          }),
        );
        continue;
      }

      coverage.push({
        metadataName: 'roleTarget',
        universalIdentifier: flatRoleTarget.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: isDefined(
          applicationAllFlatEntityMaps.flatAgentMaps.byUniversalIdentifier[
            agentUniversalIdentifier
          ],
        )
          ? 'role target of an agent that is not exported'
          : 'role target of an agent outside the application',
      });
    }
  }

  return { agents, coverage };
};
