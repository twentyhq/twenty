import { msg } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type UpdateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/update-agent.input';
import { FLAT_AGENT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-agent/constants/flat-agent-editable-properties.constant';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/overrides/utils/sanitize-overridable-entity-input.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { computeMetadataNameFromLabelOrThrow } from 'src/engine/metadata-modules/utils/compute-metadata-name-from-label-or-throw.util';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

type FlatRoleTargetToUpdateCreateDelete = {
  flatRoleTargetToUpdate?: FlatRoleTarget;
  flatRoleTargetToCreate?: FlatRoleTarget;
  flatRoleTargetToDelete?: FlatRoleTarget;
};
const computeAgentFlatRoleTargetToUpdate = ({
  roleId,
  flatAgent,
  flatRoleTargetByAgentIdMaps,
  flatRoleMaps,
}: {
  roleId: string | null | undefined;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
  flatAgent: FlatAgent;
  flatRoleMaps: AllFlatEntityMaps['flatRoleMaps'];
}): FlatRoleTargetToUpdateCreateDelete => {
  if (roleId === undefined) {
    return {};
  }

  const existingRoleTarget = flatRoleTargetByAgentIdMaps[flatAgent.id];
  const updatedAt = new Date().toISOString();

  if (roleId === null) {
    if (isDefined(existingRoleTarget)) {
      return {
        flatRoleTargetToDelete: existingRoleTarget,
      };
    }

    return {};
  }

  const flatRole = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatRoleMaps,
    flatEntityId: roleId,
  });

  if (isDefined(existingRoleTarget)) {
    return {
      flatRoleTargetToUpdate: {
        ...existingRoleTarget,
        roleId,
        roleUniversalIdentifier: flatRole.universalIdentifier,
        agentUniversalIdentifier: flatAgent.universalIdentifier,
        updatedAt,
      },
    };
  }

  return {
    flatRoleTargetToCreate: {
      id: v4(),
      roleId,
      roleUniversalIdentifier: flatRole.universalIdentifier,
      userWorkspaceId: null,
      agentId: flatAgent.id,
      agentUniversalIdentifier: flatAgent.universalIdentifier,
      apiKeyId: null,
      createdAt: updatedAt,
      updatedAt,
      universalIdentifier: v4(),
      workspaceId: flatAgent.workspaceId,
      applicationId: flatAgent.applicationId,
      applicationUniversalIdentifier: flatAgent.applicationUniversalIdentifier,
    },
  };
};

const computeUpdatedAgentName = ({
  shouldOverride,
  name,
  label,
}: {
  shouldOverride: boolean;
  name: string | undefined;
  label: string | undefined;
}): string | undefined => {
  if (shouldOverride) {
    return undefined;
  }

  if (isDefined(name) || !isDefined(label)) {
    return name;
  }

  return computeMetadataNameFromLabelOrThrow(label);
};

export type FromUpdateAgentInputToFlatAgentToUpdateArgs = {
  updateAgentInput: UpdateAgentInput;
  flatAgentMaps: FlatAgentMaps;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
  callerApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
} & Pick<AllFlatEntityMaps, 'flatRoleMaps'>;

export const fromUpdateAgentInputToFlatAgentToUpdate = ({
  updateAgentInput: rawUpdateAgentInput,
  flatAgentMaps,
  flatRoleTargetByAgentIdMaps,
  flatRoleMaps,
  callerApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: FromUpdateAgentInputToFlatAgentToUpdateArgs): {
  flatAgentToUpdate: FlatAgent;
} & FlatRoleTargetToUpdateCreateDelete => {
  const { id: agentIdToUpdate } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawUpdateAgentInput,
      ['id'],
    );

  const existingFlatAgent = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: agentIdToUpdate,
    flatEntityMaps: flatAgentMaps,
  });

  if (!isDefined(existingFlatAgent)) {
    throw new AiException('Agent not found', AiExceptionCode.AGENT_NOT_FOUND, {
      userFriendlyMessage: msg`The agent you are looking for could not be found. It may have been deleted or you may not have access to it.`,
    });
  }

  const { name, isActive, ...otherEditableAgentProperties } =
    extractAndSanitizeObjectStringFields(
      rawUpdateAgentInput,
      FLAT_AGENT_EDITABLE_PROPERTIES,
    );
  // GraphQL accepts an explicit null for any optional input, but isActive is never null
  const updatedEditableAgentProperties = {
    ...otherEditableAgentProperties,
    ...(isDefined(isActive) ? { isActive } : {}),
  };

  const shouldOverride = isCallerOverridingEntity({
    callerApplicationUniversalIdentifier,
    entityApplicationUniversalIdentifier:
      existingFlatAgent.applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
    isSystemSideEffect: false,
  });

  // The name identifies the agent to its application, so overriding the label keeps it
  if (shouldOverride && isDefined(name) && name !== existingFlatAgent.name) {
    throw new AiException(
      'Cannot rename an agent owned by another application',
      AiExceptionCode.INVALID_AGENT_INPUT,
      {
        userFriendlyMessage: msg`An agent installed by an application cannot be renamed.`,
      },
    );
  }

  const updatedName = computeUpdatedAgentName({
    shouldOverride,
    name,
    label: updatedEditableAgentProperties.label,
  });

  const { overrides, updatedEditableProperties } =
    sanitizeOverridableEntityInput({
      metadataName: 'agent',
      existingFlatEntity: existingFlatAgent,
      updatedEditableProperties: {
        ...updatedEditableAgentProperties,
        ...(isDefined(updatedName) ? { name: updatedName } : {}),
      },
      shouldOverride,
      callerApplicationUniversalIdentifier,
      workspaceCustomApplicationUniversalIdentifier,
    });

  const flatAgentToUpdate: FlatAgent = {
    ...mergeUpdateInExistingRecord({
      existing: existingFlatAgent,
      properties: FLAT_AGENT_EDITABLE_PROPERTIES,
      update: updatedEditableProperties,
    }),
    overrides,
  };

  const {
    flatRoleTargetToUpdate,
    flatRoleTargetToCreate,
    flatRoleTargetToDelete,
  } = computeAgentFlatRoleTargetToUpdate({
    roleId: rawUpdateAgentInput.roleId,
    flatAgent: existingFlatAgent,
    flatRoleTargetByAgentIdMaps,
    flatRoleMaps,
  });

  return {
    flatAgentToUpdate,
    flatRoleTargetToUpdate,
    flatRoleTargetToCreate,
    flatRoleTargetToDelete,
  };
};
