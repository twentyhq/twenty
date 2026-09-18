import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { isWorkspaceSuspended } from 'src/engine/core-modules/workspace/utils/is-workspace-suspended.util';

describe('isWorkspaceSuspended', () => {
  it.each([
    WorkspaceActivationStatus.SUSPENDED,
    WorkspaceActivationStatus.INACTIVE,
  ])('should return true when the workspace is %s', (activationStatus) => {
    expect(
      isWorkspaceSuspended({ activationStatus, deletedAt: undefined }),
    ).toBe(true);
  });

  it.each([
    WorkspaceActivationStatus.ACTIVE,
    WorkspaceActivationStatus.CREATED,
    WorkspaceActivationStatus.PENDING_CREATION,
    WorkspaceActivationStatus.ONGOING_CREATION,
  ])('should return false when the workspace is %s', (activationStatus) => {
    expect(
      isWorkspaceSuspended({ activationStatus, deletedAt: undefined }),
    ).toBe(false);
  });

  it.each([
    WorkspaceActivationStatus.SUSPENDED,
    WorkspaceActivationStatus.INACTIVE,
  ])(
    'should return false when a %s workspace is soft deleted',
    (activationStatus) => {
      expect(
        isWorkspaceSuspended({
          activationStatus,
          deletedAt: '2026-09-16T10:00:00.000Z',
        }),
      ).toBe(false);
    },
  );

  it.each([null, undefined])(
    'should return false when the workspace is %s',
    (workspace) => {
      expect(isWorkspaceSuspended(workspace)).toBe(false);
    },
  );
});
