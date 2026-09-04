import { RecordShareAccessLevel } from 'twenty-shared/types';

import { validateShareWithArg } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/validate-share-with-arg.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

const userAuthContext = {
  type: 'user',
  workspace: { id: 'workspace-1' },
  workspaceMemberId: 'workspace-member-1',
} as unknown as WorkspaceAuthContext;

const apiKeyAuthContext = {
  type: 'apiKey',
  workspace: { id: 'workspace-1' },
  apiKey: { id: 'api-key-1' },
} as unknown as WorkspaceAuthContext;

const systemAuthContext = {
  type: 'system',
  workspace: { id: 'workspace-1' },
} as unknown as WorkspaceAuthContext;

const OTHER_WORKSPACE_MEMBER_ID = '20202020-0000-4000-8000-000000000002';
const ROLE_ID = '20202020-0000-4000-8000-000000000003';
const SHARE_WITH_REQUIRED_MESSAGE =
  'Creating a record of a private object requires the shareWith argument';

describe('validateShareWithArg', () => {
  describe('with record sharing enabled', () => {
    const isRecordSharingEnabled = true;

    it('should accept a user without shareWith', () => {
      expect(() =>
        validateShareWithArg({
          authContext: userAuthContext,
          isRecordSharingEnabled,
        }),
      ).not.toThrow();
    });

    it('should reject an api key without shareWith', () => {
      expect(() =>
        validateShareWithArg({
          authContext: apiKeyAuthContext,
          isRecordSharingEnabled,
        }),
      ).toThrow(SHARE_WITH_REQUIRED_MESSAGE);
    });

    it('should reject an api key with an empty shareWith', () => {
      expect(() =>
        validateShareWithArg({
          authContext: apiKeyAuthContext,
          isRecordSharingEnabled,
          shareWith: [],
        }),
      ).toThrow(SHARE_WITH_REQUIRED_MESSAGE);
    });

    it('should reject a system caller without shareWith', () => {
      expect(() =>
        validateShareWithArg({
          authContext: systemAuthContext,
          isRecordSharingEnabled,
        }),
      ).toThrow(SHARE_WITH_REQUIRED_MESSAGE);
    });

    it('should accept an api key with one valid entry', () => {
      expect(() =>
        validateShareWithArg({
          authContext: apiKeyAuthContext,
          isRecordSharingEnabled,
          shareWith: [
            { everyone: true, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      ).not.toThrow();
    });
  });

  describe('with record sharing disabled', () => {
    const isRecordSharingEnabled = false;

    it('should accept an api key without shareWith', () => {
      expect(() =>
        validateShareWithArg({
          authContext: apiKeyAuthContext,
          isRecordSharingEnabled,
        }),
      ).not.toThrow();
    });

    it('should accept a system caller with an empty shareWith', () => {
      expect(() =>
        validateShareWithArg({
          authContext: systemAuthContext,
          isRecordSharingEnabled,
          shareWith: [],
        }),
      ).not.toThrow();
    });

    it('should still reject a malformed entry', () => {
      expect(() =>
        validateShareWithArg({
          authContext: apiKeyAuthContext,
          isRecordSharingEnabled,
          shareWith: [
            { everyone: false, accessLevel: RecordShareAccessLevel.READ },
          ],
        }),
      ).toThrow(
        'Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone',
      );
    });
  });

  it('should reject an entry targeting no principal', () => {
    expect(() =>
      validateShareWithArg({
        authContext: userAuthContext,
        isRecordSharingEnabled: true,
        shareWith: [
          { everyone: false, accessLevel: RecordShareAccessLevel.READ },
        ],
      }),
    ).toThrow(
      'Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone',
    );
  });

  it('should reject a workspaceMemberId that is not a uuid', () => {
    expect(() =>
      validateShareWithArg({
        authContext: userAuthContext,
        isRecordSharingEnabled: true,
        shareWith: [
          {
            workspaceMemberId: 'not-a-uuid',
            accessLevel: RecordShareAccessLevel.READ,
          },
        ],
      }),
    ).toThrow('Value "not-a-uuid" is not a valid UUID');
  });

  it('should reject an entry targeting two principals even for a user', () => {
    expect(() =>
      validateShareWithArg({
        authContext: userAuthContext,
        isRecordSharingEnabled: true,
        shareWith: [
          {
            workspaceMemberId: OTHER_WORKSPACE_MEMBER_ID,
            roleId: ROLE_ID,
            accessLevel: RecordShareAccessLevel.READ,
          },
        ],
      }),
    ).toThrow(
      'Each shareWith entry must target exactly one of workspaceMemberId, roleId or everyone',
    );
  });
});
