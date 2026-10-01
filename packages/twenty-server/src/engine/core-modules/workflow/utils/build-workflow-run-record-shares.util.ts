import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';

export const buildWorkflowRunRecordShares = ({
  objectMetadataId,
  workflowRunIds,
  creatorWorkspaceMemberId,
}: {
  objectMetadataId: string;
  workflowRunIds: string[];
  creatorWorkspaceMemberId: string | null;
}): RecordShareInput[] =>
  isDefined(creatorWorkspaceMemberId)
    ? workflowRunIds.map((workflowRunId) => ({
        objectMetadataId,
        recordId: workflowRunId,
        principalId: creatorWorkspaceMemberId,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.OWNER,
        sourceId: workflowRunId,
      }))
    : [];
