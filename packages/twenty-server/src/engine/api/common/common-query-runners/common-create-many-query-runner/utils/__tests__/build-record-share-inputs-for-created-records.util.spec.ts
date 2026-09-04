import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { buildRecordShareInputsForCreatedRecords } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/build-record-share-inputs-for-created-records.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

const OBJECT_METADATA_ID = 'object-metadata-1';
const WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000002';
const ROLE_ID = '20202020-0000-4000-8000-000000000003';
const APPLICATION_ID = 'application-1';

const userAuthContext = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  workspaceMemberId: WORKSPACE_MEMBER_ID,
} as unknown as WorkspaceAuthContext;

const apiKeyAuthContext = {
  type: 'apiKey',
  workspace: { id: 'workspace-1' },
  apiKey: { id: 'api-key-1' },
} as unknown as WorkspaceAuthContext;

const applicationAuthContext = {
  type: 'application',
  workspace: { id: 'workspace-1' },
  application: { id: APPLICATION_ID },
} as unknown as WorkspaceAuthContext;

describe('buildRecordShareInputsForCreatedRecords', () => {
  it('should give a user a FULL owner row per record', () => {
    expect(
      buildRecordShareInputsForCreatedRecords({
        recordIds: ['record-1', 'record-2'],
        objectMetadataId: OBJECT_METADATA_ID,
        authContext: userAuthContext,
      }),
    ).toEqual([
      {
        recordId: 'record-1',
        objectMetadataId: OBJECT_METADATA_ID,
        principalId: WORKSPACE_MEMBER_ID,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.OWNER,
        sourceId: 'record-1',
      },
      {
        recordId: 'record-2',
        objectMetadataId: OBJECT_METADATA_ID,
        principalId: WORKSPACE_MEMBER_ID,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.OWNER,
        sourceId: 'record-2',
      },
    ]);
  });

  it('should add a MANUAL row sourced from the creating member for each shareWith entry', () => {
    expect(
      buildRecordShareInputsForCreatedRecords({
        recordIds: ['record-1'],
        objectMetadataId: OBJECT_METADATA_ID,
        authContext: userAuthContext,
        shareWith: [
          { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.READ },
          {
            workspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
            accessLevel: RecordShareAccessLevel.READ_WRITE,
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({ rowCause: RecordShareRowCause.OWNER }),
      {
        recordId: 'record-1',
        objectMetadataId: OBJECT_METADATA_ID,
        principalId: ROLE_ID,
        principalType: RecordSharePrincipalType.ROLE,
        accessLevel: RecordShareAccessLevel.READ,
        rowCause: RecordShareRowCause.MANUAL,
        sourceId: WORKSPACE_MEMBER_ID,
      },
      {
        recordId: 'record-1',
        objectMetadataId: OBJECT_METADATA_ID,
        principalId: OTHER_WORKSPACE_MEMBER_ID,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
        rowCause: RecordShareRowCause.MANUAL,
        sourceId: WORKSPACE_MEMBER_ID,
      },
    ]);
  });

  it('should write MANUAL rows sourced from the record for an api key', () => {
    expect(
      buildRecordShareInputsForCreatedRecords({
        recordIds: ['record-1'],
        objectMetadataId: OBJECT_METADATA_ID,
        authContext: apiKeyAuthContext,
        shareWith: [
          { everyone: true, accessLevel: RecordShareAccessLevel.READ },
        ],
      }),
    ).toEqual([
      {
        recordId: 'record-1',
        objectMetadataId: OBJECT_METADATA_ID,
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.READ,
        rowCause: RecordShareRowCause.MANUAL,
        sourceId: 'record-1',
      },
    ]);
  });

  it('should write APPLICATION rows sourced from the application', () => {
    expect(
      buildRecordShareInputsForCreatedRecords({
        recordIds: ['record-1'],
        objectMetadataId: OBJECT_METADATA_ID,
        authContext: applicationAuthContext,
        shareWith: [
          { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.FULL },
        ],
      }),
    ).toEqual([
      {
        recordId: 'record-1',
        objectMetadataId: OBJECT_METADATA_ID,
        principalId: ROLE_ID,
        principalType: RecordSharePrincipalType.ROLE,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.APPLICATION,
        sourceId: APPLICATION_ID,
      },
    ]);
  });
});
