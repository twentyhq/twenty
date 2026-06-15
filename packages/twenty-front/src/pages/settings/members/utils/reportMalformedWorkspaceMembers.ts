type ReportMalformedWorkspaceMembersInput = {
  workspaceMemberIds: string[];
};

const reportedWorkspaceMemberIds = new Set<string>();

export const reportMalformedWorkspaceMembers = async ({
  workspaceMemberIds,
}: ReportMalformedWorkspaceMembersInput) => {
  const unreportedWorkspaceMemberIds = workspaceMemberIds.filter(
    (workspaceMemberId) => !reportedWorkspaceMemberIds.has(workspaceMemberId),
  );

  if (unreportedWorkspaceMemberIds.length === 0) {
    return;
  }

  try {
    const { captureMessage, withScope } = await import('@sentry/react');

    withScope((scope) => {
      scope.setLevel('warning');
      scope.setFingerprint(['settings-members-missing-workspace-member-name']);
      scope.setTag('settings-page', 'members-team-tab');
      scope.setContext('malformed-workspace-members', {
        workspaceMemberCount: unreportedWorkspaceMemberIds.length,
        workspaceMemberIds: unreportedWorkspaceMemberIds,
      });

      captureMessage('Workspace member records are missing name fields.');
    });

    for (const workspaceMemberId of unreportedWorkspaceMemberIds) {
      reportedWorkspaceMemberIds.add(workspaceMemberId);
    }
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture malformed workspace member records:',
      sentryError,
    );
  }
};
