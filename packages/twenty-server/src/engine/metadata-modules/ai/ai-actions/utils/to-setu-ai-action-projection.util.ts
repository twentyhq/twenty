import {
  type SetuAiActionPayload,
  type SetuAiActionProjection,
  type SetuAiActionReceipt,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type SetuAiActionRequestEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-request.entity';
import { getSetuAiActionAllowedOperations } from 'src/engine/metadata-modules/ai/ai-actions/utils/get-setu-ai-action-allowed-operations.util';

export const toSetuAiActionProjection = (
  actionRequest: SetuAiActionRequestEntity,
): SetuAiActionProjection =>
  ({
    schemaVersion: 1,
    id: actionRequest.id,
    logicalActionId: actionRequest.logicalActionId,
    revision: actionRequest.revision,
    stateVersion: actionRequest.stateVersion,
    status: actionRequest.status,
    allowedOperations: getSetuAiActionAllowedOperations(actionRequest.status),
    expiresAt: actionRequest.expiresAt?.toISOString() ?? null,
    errorCode: actionRequest.errorCode,
    receipt: isDefined(actionRequest.receipt)
      ? (actionRequest.receipt as SetuAiActionReceipt)
      : null,
    createdAt: actionRequest.createdAt.toISOString(),
    updatedAt: actionRequest.updatedAt.toISOString(),
    kind: actionRequest.kind,
    payload: actionRequest.payload,
  }) as SetuAiActionProjection & SetuAiActionPayload;
