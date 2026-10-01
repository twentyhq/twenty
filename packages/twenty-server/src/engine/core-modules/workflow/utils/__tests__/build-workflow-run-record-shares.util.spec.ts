import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { buildWorkflowRunRecordShares } from 'src/engine/core-modules/workflow/utils/build-workflow-run-record-shares.util';

const OBJECT_METADATA_ID = 'object-metadata-id';
const CREATOR_ID = 'creator-workspace-member-id';

describe('buildWorkflowRunRecordShares', () => {
  it('grants the creator each run of their workflow', () => {
    expect(
      buildWorkflowRunRecordShares({
        objectMetadataId: OBJECT_METADATA_ID,
        workflowRunIds: ['run-1', 'run-2'],
        creatorWorkspaceMemberId: CREATOR_ID,
      }).map(
        ({ recordId, principalId, principalType, rowCause, sourceId }) => ({
          recordId,
          principalId,
          principalType,
          rowCause,
          sourceId,
        }),
      ),
    ).toEqual(
      ['run-1', 'run-2'].map((runId) => ({
        recordId: runId,
        principalId: CREATOR_ID,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        rowCause: RecordShareRowCause.OWNER,
        sourceId: runId,
      })),
    );
  });

  it('grants nothing without a resolvable creator', () => {
    expect(
      buildWorkflowRunRecordShares({
        objectMetadataId: OBJECT_METADATA_ID,
        workflowRunIds: ['run-1'],
        creatorWorkspaceMemberId: null,
      }),
    ).toEqual([]);
  });
});
