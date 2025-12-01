import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/compute-metadata-name-from-label.util';

export const fromCreateAgentInputToFlatAgent = ({
  createAgentInput: rawCreateAgentInput,
  workspaceId,
}: {
  createAgentInput: CreateAgentInput & { applicationId: string };
  workspaceId: string;
}): {
  flatAgentToCreate: FlatAgent;
  flatRoleTargetToCreate: FlatRoleTarget | null;
} => {
  const createAgentInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateAgentInput,
      [
        'name',
        'label',
        'icon',
        'description',
        'prompt',
        'modelId',
        'standardId',
        'applicationId',
        'roleId',
      ],
    );

  const now = new Date();
  const id = v4();
  const standardId = createAgentInput.standardId ?? null;
  const universalIdentifier = standardId ?? id;

  const flatAgentToCreate: FlatAgent = {
    id,
    standardId,
    name: isNonEmptyString(createAgentInput.name)
      ? createAgentInput.name
      : computeMetadataNameFromLabel(createAgentInput.label),
    label: createAgentInput.label,
    icon: createAgentInput.icon ?? null,
    description: createAgentInput.description ?? null,
    prompt: createAgentInput.prompt,
    modelId: createAgentInput.modelId,
    responseFormat: createAgentInput.responseFormat ?? { type: 'text' },
    workspaceId,
    isCustom: true,
    universalIdentifier,
    applicationId: createAgentInput.applicationId,
    modelConfiguration: createAgentInput.modelConfiguration ?? null,
    evaluationInputs: createAgentInput.evaluationInputs ?? [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const flatRoleTargetToCreate: FlatRoleTarget | null = isDefined(
    createAgentInput.roleId,
  )
    ? {
        id: v4(),
        roleId: createAgentInput.roleId,
        userWorkspaceId: null,
        agentId: id,
        apiKeyId: null,
        createdAt: now,
        updatedAt: now,
        universalIdentifier: v4(),
        workspaceId,
        applicationId: createAgentInput.applicationId,
      }
    : null;

  return {
    flatAgentToCreate,
    flatRoleTargetToCreate,
  };
};
