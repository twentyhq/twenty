import { isNonEmptyString } from '@sniptt/guards';
import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export type FromCreateAgentInputToFlatAgentArgs = {
  createAgentInput: CreateAgentInput & { applicationId: string };
  workspaceId: string;
};

export const fromCreateAgentInputToFlatAgent = ({
  createAgentInput: rawCreateAgentInput,
  workspaceId,
}: FromCreateAgentInputToFlatAgentArgs): {
  flatAgentToCreate: FlatAgent;
  flatRoleTargetToCreate: FlatRoleTarget | null;
} => {
  const { roleId, ...createAgentInput } =
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

  const createdAt = new Date().toISOString();
  const agentId = v4();
  const standardId = createAgentInput.standardId ?? null;
  const universalIdentifier = standardId ?? agentId;

  const flatAgentToCreate: FlatAgent = {
    id: agentId,
    standardId,
    name: isNonEmptyString(createAgentInput.name)
      ? createAgentInput.name
      : computeMetadataNameFromLabel({ label: createAgentInput.label }),
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
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  };

  const flatRoleTargetToCreate: FlatRoleTarget | null = isDefined(roleId)
    ? {
        id: v4(),
        roleId,
        userWorkspaceId: null,
        agentId,
        apiKeyId: null,
        createdAt,
        updatedAt: createdAt,
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
