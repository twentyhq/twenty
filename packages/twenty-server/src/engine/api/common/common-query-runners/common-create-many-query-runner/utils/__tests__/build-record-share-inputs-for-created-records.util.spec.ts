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
const API_KEY_ROLE_ID = '20202020-0000-4000-8000-000000000004';
const APPLICATION_ROLE_ID = '20202020-0000-4000-8000-000000000005';
const API_KEY_ID = 'api-key-1';
const APPLICATION_ID = 'application-1';

const userAuthContext = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  workspaceMemberId: WORKSPACE_MEMBER_ID,
} as unknown as WorkspaceAuthContext;

const apiKeyAuthContext = {
  type: 'apiKey',
  workspace: { id: 'workspace-1' },
  apiKey: { id: API_KEY_ID },
} as unknown as WorkspaceAuthContext;

const applicationAuthContext = {
  type: 'application',
  workspace: { id: 'workspace-1' },
  application: { id: APPLICATION_ID, defaultRoleId: APPLICATION_ROLE_ID },
} as unknown as WorkspaceAuthContext;

const systemAuthContext = {
  type: 'system',
  workspace: { id: 'workspace-1' },
} as unknown as WorkspaceAuthContext;

const apiKeyRoleMap = { [API_KEY_ID]: API_KEY_ROLE_ID };

const everyoneFullRowFor = (recordId: string) => ({
  recordId,
  objectMetadataId: OBJECT_METADATA_ID,
  principalId: EVERYONE_PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.APPLICATION,
  sourceId: OBJECT_METADATA_ID,
});

describe('buildRecordShareInputsForCreatedRecords', () => {
  describe('with record sharing enabled', () => {
    const isRecordSharingEnabled = true;

    it('should give a user a FULL owner row per record', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1', 'record-2'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: userAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
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

    it('should give the owner field value the OWNER row instead of the creator', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: userAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
          ownerWorkspaceMemberIdByRecordId: {
            'record-1': OTHER_WORKSPACE_MEMBER_ID,
          },
        }),
      ).toEqual([
        {
          recordId: 'record-1',
          objectMetadataId: OBJECT_METADATA_ID,
          principalId: OTHER_WORKSPACE_MEMBER_ID,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: 'record-1',
        },
      ]);
    });

    it('should fall back to the creator rule when the owner field value is null', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1', 'record-2'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: apiKeyAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
          ownerWorkspaceMemberIdByRecordId: {
            'record-1': null,
            'record-2': OTHER_WORKSPACE_MEMBER_ID,
          },
        }),
      ).toEqual([
        expect.objectContaining({
          recordId: 'record-1',
          principalId: API_KEY_ROLE_ID,
          principalType: RecordSharePrincipalType.ROLE,
          rowCause: RecordShareRowCause.MANUAL,
        }),
        expect.objectContaining({
          recordId: 'record-2',
          principalId: OTHER_WORKSPACE_MEMBER_ID,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          rowCause: RecordShareRowCause.OWNER,
        }),
      ]);
    });

    it('should add a MANUAL row sourced from the creating member for each shareWith entry', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: userAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
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

    it('should give an api key a FULL row for its role next to MANUAL rows sourced from the record', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: apiKeyAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      ).toEqual([
        {
          recordId: 'record-1',
          objectMetadataId: OBJECT_METADATA_ID,
          principalId: API_KEY_ROLE_ID,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: 'record-1',
        },
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

    it('should write only the shareWith rows for an api key without a role', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: apiKeyAuthContext,
          apiKeyRoleMap: {},
          isRecordSharingEnabled,
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      ).toEqual([
        expect.objectContaining({
          principalId: EVERYONE_PRINCIPAL_ID,
          accessLevel: RecordShareAccessLevel.READ,
        }),
      ]);
    });

    it('should give an application a FULL row for its default role next to APPLICATION rows sourced from the application', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: applicationAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
          shareWith: [
            { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.FULL },
          ],
        }),
      ).toEqual([
        {
          recordId: 'record-1',
          objectMetadataId: OBJECT_METADATA_ID,
          principalId: APPLICATION_ROLE_ID,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.APPLICATION,
          sourceId: APPLICATION_ID,
        },
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

    it('should skip the creator role row when shareWith already names that role', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: applicationAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
          shareWith: [
            {
              roleId: APPLICATION_ROLE_ID,
              accessLevel: RecordShareAccessLevel.READ,
            },
          ],
        }),
      ).toEqual([
        {
          recordId: 'record-1',
          objectMetadataId: OBJECT_METADATA_ID,
          principalId: APPLICATION_ROLE_ID,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.APPLICATION,
          sourceId: APPLICATION_ID,
        },
      ]);
    });

    it('should write no creator row for an application without a default role', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: {
            ...applicationAuthContext,
            application: { id: APPLICATION_ID, defaultRoleId: null },
          } as unknown as WorkspaceAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
          shareWith: [
            { roleId: ROLE_ID, accessLevel: RecordShareAccessLevel.FULL },
          ],
        }),
      ).toEqual([expect.objectContaining({ principalId: ROLE_ID })]);
    });

    it('should write only the shareWith rows for a system caller', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: systemAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
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
  });

  describe('with record sharing disabled', () => {
    const isRecordSharingEnabled = false;

    it('should still give a user the FULL owner row', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: userAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
        }),
      ).toEqual([
        expect.objectContaining({
          principalId: WORKSPACE_MEMBER_ID,
          rowCause: RecordShareRowCause.OWNER,
        }),
      ]);
    });

    it('should write one EVERYONE FULL row per record for an api key without shareWith', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1', 'record-2'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: apiKeyAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
        }),
      ).toEqual([
        everyoneFullRowFor('record-1'),
        everyoneFullRowFor('record-2'),
      ]);
    });

    it('should write one EVERYONE FULL row for a system caller with an empty shareWith', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: systemAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
          shareWith: [],
        }),
      ).toEqual([everyoneFullRowFor('record-1')]);
    });

    it('should honour an explicit shareWith from an api key', () => {
      expect(
        buildRecordShareInputsForCreatedRecords({
          recordIds: ['record-1'],
          objectMetadataId: OBJECT_METADATA_ID,
          authContext: apiKeyAuthContext,
          apiKeyRoleMap,
          isRecordSharingEnabled,
          shareWith: [
            {
              workspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
              accessLevel: RecordShareAccessLevel.READ,
            },
          ],
        }),
      ).toEqual([
        expect.objectContaining({
          principalId: API_KEY_ROLE_ID,
          accessLevel: RecordShareAccessLevel.FULL,
        }),
        expect.objectContaining({
          principalId: OTHER_WORKSPACE_MEMBER_ID,
          accessLevel: RecordShareAccessLevel.READ,
        }),
      ]);
    });
  });
});
