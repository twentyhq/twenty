import { WorkspaceActivationStatus } from '@/workspace/types/WorkspaceActivationStatus';
import { isWorkspaceActiveOrSuspended } from '@/workspace/utils/isWorkspaceActiveOrSuspended';

describe('isWorkspaceActiveOrSuspended', () => {
  it('should return true for Active workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.ACTIVE,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(true);
  });

  it('should return true for Suspended workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(true);
  });

  it('should return false for Inactive workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.INACTIVE,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(false);
  });

  it('should return false for OngoingCreation workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(false);
  });

  it('should return false for PendingCreation workspace', () => {
    const workspace = {
      activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    };

    expect(isWorkspaceActiveOrSuspended(workspace)).toBe(false);
  });

  it('should return false for undefined workspace', () => {
    expect(isWorkspaceActiveOrSuspended(undefined)).toBe(false);
  });

  it('should return false for null workspace', () => {
    expect(isWorkspaceActiveOrSuspended(null)).toBe(false);
  });
});
