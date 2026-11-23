import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export type FromCreateAgentInputToFlatAgentArgs = {
  createAgentInput: CreateAgentInput;
  isSystem: boolean;
  workspaceId: string;
  userWorkspaceId: string | undefined;
  flatApplication: FlatApplication;
  flatRoleMaps: AllFlatEntityMaps['flatRoleMaps'];
};

export const fromCreateAgentInputToFlatAgent = ({
  createAgentInput: rawCreateAgentInput,
  isSystem,
  workspaceId,
  userWorkspaceId,
  flatApplication,
  flatRoleMaps,
}: FromCreateAgentInputToFlatAgentArgs): {
  flatAgentToCreate: FlatAgent;
  flatRoleTargetToCreate: FlatRoleTarget | null;
} => {
  const { roleId, ...createAgentInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateAgentInput,
      ['name', 'label', 'icon', 'description', 'prompt', 'modelId', 'roleId'],
    );

  const isPrivate = createAgentInput.isPrivate ?? false;

  if (isPrivate && !isDefined(userWorkspaceId)) {
    throw new AiException(
      'A private agent can only be created by a workspace member',
      AiExceptionCode.AGENT_PRIVACY_CHANGE_NOT_ALLOWED,
      {
        userFriendlyMessage: msg`Only a workspace member can create a private agent.`,
      },
    );
  }

  const createdAt = new Date().toISOString();
  const agentId = v4();

  const flatAgentToCreate: FlatAgent = {
    id: agentId,
    name: isNonEmptyString(createAgentInput.name)
      ? createAgentInput.name
      : computeMetadataNameFromLabel({ label: createAgentInput.label }),
    label: createAgentInput.label,
    icon: createAgentInput.icon ?? null,
    avatarColor: createAgentInput.avatarColor ?? null,
    avatarShape: createAgentInput.avatarShape ?? null,
    description: createAgentInput.description ?? null,
    prompt: createAgentInput.prompt,
    modelId: createAgentInput.modelId,
    responseFormat: createAgentInput.responseFormat ?? { type: 'text' },
    workspaceId,
    isSystem,
    isActive: true,
    overrides: null,
    universalIdentifier: v4(),
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    modelConfiguration: createAgentInput.modelConfiguration ?? null,
    triggers: createAgentInput.triggers ?? [],
    isPrivate,
    createdByUserWorkspaceId: userWorkspaceId ?? null,
    navigationMenuItemIds: [],
    navigationMenuItemUniversalIdentifiers: [],
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  };

  let flatRoleTargetToCreate: FlatRoleTarget | null = null;

  if (isDefined(roleId)) {
    const { roleUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'roleTarget',
        foreignKeyValues: { roleId },
        flatEntityMaps: { flatRoleMaps },
      });

    flatRoleTargetToCreate = {
      id: v4(),
      roleId,
      roleUniversalIdentifier,
      isSystemSideEffect: false,
      userWorkspaceId: null,
      agentId,
      agentUniversalIdentifier: flatAgentToCreate.universalIdentifier,
      apiKeyId: null,
      webhookId: null,
      webhookUniversalIdentifier: null,
      targetApplicationId: null,
      targetApplicationUniversalIdentifier: null,
      createdAt,
      updatedAt: createdAt,
      universalIdentifier: v4(),
      workspaceId,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    };
  }

  return {
    flatAgentToCreate,
    flatRoleTargetToCreate,
  };
};
