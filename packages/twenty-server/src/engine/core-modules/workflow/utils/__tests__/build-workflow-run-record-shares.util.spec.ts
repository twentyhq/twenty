import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { buildWorkflowRunRecordShares } from 'src/engine/core-modules/workflow/utils/build-workflow-run-record-shares.util';

const OBJECT_METADATA_ID = 'object-metadata-id';
const CREATOR_ID = 'creator-workspace-member-id';

const principalsByRun = (
  shares: ReturnType<typeof buildWorkflowRunRecordShares>,
) =>
  shares.map(
    ({ recordId, principalId, principalType, rowCause, sourceId }) => ({
      recordId,
      principalId,
      principalType,
      rowCause,
      sourceId,
    }),
  );

describe('buildWorkflowRunRecordShares', () => {
  it('grants everyone and the creator the runs of a workspace-visible workflow', () => {
    expect(
      principalsByRun(
        buildWorkflowRunRecordShares({
          objectMetadataId: OBJECT_METADATA_ID,
          workflowRunIds: ['run-1'],
          isWorkspaceVisible: true,
          creatorWorkspaceMemberId: CREATOR_ID,
        }),
      ),
    ).toEqual([
      {
        recordId: 'run-1',
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        rowCause: RecordShareRowCause.RULE,
        sourceId: 'run-1',
      },
      {
        recordId: 'run-1',
        principalId: CREATOR_ID,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        rowCause: RecordShareRowCause.OWNER,
        sourceId: 'run-1',
      },
    ]);
  });

  it('grants only the creator the runs of a private workflow', () => {
    expect(
      principalsByRun(
        buildWorkflowRunRecordShares({
          objectMetadataId: OBJECT_METADATA_ID,
          workflowRunIds: ['run-1', 'run-2'],
          isWorkspaceVisible: false,
          creatorWorkspaceMemberId: CREATOR_ID,
        }),
      ).map(({ recordId, principalId }) => [recordId, principalId]),
    ).toEqual([
      ['run-1', CREATOR_ID],
      ['run-2', CREATOR_ID],
    ]);
  });

  it('grants nothing for a private workflow without a resolvable creator', () => {
    expect(
      buildWorkflowRunRecordShares({
        objectMetadataId: OBJECT_METADATA_ID,
        workflowRunIds: ['run-1'],
        isWorkspaceVisible: false,
        creatorWorkspaceMemberId: null,
      }),
    ).toEqual([]);
  });
});
