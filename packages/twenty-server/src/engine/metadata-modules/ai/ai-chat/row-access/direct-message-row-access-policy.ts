import { msg } from '@lingui/core/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { DIRECT_MESSAGE_PERMISSION_OBJECTS } from 'src/engine/permissions/direct-message/constants/direct-message-permission-objects.constant';
import { buildPermissionsDirectMessageCondition } from 'src/engine/permissions/direct-message/utils/build-permissions-direct-message-condition.util';
import { findDirectMessageAdmittedRecordIds } from 'src/engine/permissions/direct-message/utils/find-direct-message-admitted-record-ids.util';
import { findDirectMessagePermissionObject } from 'src/engine/permissions/direct-message/utils/find-direct-message-permission-object.util';
import { findDirectMessageThreadPairs } from 'src/engine/permissions/direct-message/utils/find-direct-message-thread-pairs.util';
import { hasDirectMessageThreadIdentity } from 'src/engine/permissions/direct-message/utils/has-direct-message-thread-identity.util';
import { isWorkspaceMemberInDirectMessagePair } from 'src/engine/permissions/direct-message/utils/is-workspace-member-in-direct-message-pair.util';
import { validateDirectMessageRecordTargetsOrThrow } from 'src/engine/permissions/direct-message/utils/validate-direct-message-record-targets-or-throw.util';
import { validateDirectMessageRecordTransitionsOrThrow } from 'src/engine/permissions/direct-message/utils/validate-direct-message-record-transitions-or-throw.util';
import { validateDirectMessageRecordsForWriteOrThrow } from 'src/engine/permissions/direct-message/utils/validate-direct-message-records-for-write-or-throw.util';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { type ObjectRowAccessPolicy } from 'src/engine/permissions/row-policy/types/object-row-access-policy.type';

export const DIRECT_MESSAGE_ROW_ACCESS_POLICY: ObjectRowAccessPolicy = {
  objectUniversalIdentifiers: DIRECT_MESSAGE_PERMISSION_OBJECTS.map(
    (objectName) => STANDARD_OBJECTS[objectName].universalIdentifier,
  ),
  buildCondition: buildPermissionsDirectMessageCondition,
  findAdmittedRecordIds: findDirectMessageAdmittedRecordIds,
  validateWritesOrThrow: async (request) => {
    await validateDirectMessageRecordTransitionsOrThrow(request);
    await validateDirectMessageRecordsForWriteOrThrow({
      ...request,
      records: [...request.recordsBefore, ...request.records],
    });

    if (
      findDirectMessagePermissionObject(request) !== 'agentChatThreadTarget'
    ) {
      return;
    }

    await validateDirectMessageRecordTargetsOrThrow({
      ...request,
      targetRelations: request.targetRelations.filter(
        ({ fieldName }) => fieldName !== 'thread',
      ),
    });
  },
  validateSharingOrThrow: async (request) => {
    if (
      findDirectMessagePermissionObject(request) !== 'agentChatThread' ||
      !isNonEmptyArray(request.recordIds)
    ) {
      return;
    }

    const pairs = await findDirectMessageThreadPairs({
      repository:
        request.transactionScope.getRepositoryWithoutPermissionChecks<AgentChatThreadWorkspaceEntity>(
          'agentChatThread',
        ),
      metadataMaps: request.metadataMaps,
      threadIds: request.recordIds,
    });

    for (const pair of pairs.values()) {
      if (request.isPrivate === false && hasDirectMessageThreadIdentity(pair)) {
        throw new RecordShareException(
          doNotTranslate('Direct messages must remain private'),
          RecordShareExceptionCode.INVALID_SHARE_WITH,
          { userFriendlyMessage: msg`Direct messages must remain private.` },
        );
      }

      for (const principal of request.principals ?? []) {
        const workspaceMemberId =
          principal.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER
            ? principal.principalId
            : undefined;

        if (
          isWorkspaceMemberInDirectMessagePair({
            directMessagePair: pair,
            workspaceMemberId,
          })
        ) {
          continue;
        }

        throw new RecordShareException(
          doNotTranslate(
            'Direct messages cannot be shared outside their member pair',
          ),
          RecordShareExceptionCode.INVALID_SHARE_WITH,
          {
            userFriendlyMessage: msg`Direct messages can only be shared with their two members.`,
          },
        );
      }
    }
  },
};
