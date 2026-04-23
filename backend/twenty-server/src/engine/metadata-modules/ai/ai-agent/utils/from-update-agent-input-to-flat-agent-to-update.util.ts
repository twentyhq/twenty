import { msg } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { type UpdateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/update-agent.input';
import { FLAT_AGENT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-agent/constants/flat-agent-editable-properties.constant';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
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

export type FromUpdateAgentInputToFlatAgentToUpdateArgs = {
  updateAgentInput: UpdateAgentInput;
  flatAgentMaps: FlatAgentMaps;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
} & Pick<AllFlatEntityMaps, 'flatRoleMaps'>;

export const fromUpdateAgentInputToFlatAgentToUpdate = ({
  updateAgentInput: rawUpdateAgentInput,
  flatAgentMaps,
  flatRoleTargetByAgentIdMaps,
  flatRoleMaps,
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
    throw new AgentException(
      'Agent not found',
      AgentExceptionCode.AGENT_NOT_FOUND,
      {
        userFriendlyMessage: msg`The agent you are looking for could not be found. It may have been deleted or you may not have access to it.`,
      },
    );
  }

  const updatedEditableAgentProperties = extractAndSanitizeObjectStringFields(
    rawUpdateAgentInput,
    FLAT_AGENT_EDITABLE_PROPERTIES,
  );

  if (
    isDefined(updatedEditableAgentProperties.label) &&
    !isDefined(updatedEditableAgentProperties.name)
  ) {
    updatedEditableAgentProperties.name = computeMetadataNameFromLabelOrThrow(
      updatedEditableAgentProperties.label,
    );
  }

  const flatAgentToUpdate: FlatAgent = mergeUpdateInExistingRecord({
    existing: existingFlatAgent,
    properties: FLAT_AGENT_EDITABLE_PROPERTIES,
    update: updatedEditableAgentProperties,
  });

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
