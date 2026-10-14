const toNumberOrNull = (value: unknown): number | null =>
  typeof value === 'number' ? value : null;

export const parseUserAllowanceFirstScriptReply = (
  reply: unknown,
):
  | {
      userShare: number;
      userAllowanceConsumed: number;
      workspaceAllowanceConsumed: number | null;
    }
  | {
      userShare: null;
      userAllowanceConsumed: number | null;
      workspaceAllowanceConsumed: number | null;
    } => {
  if (!Array.isArray(reply)) {
    throw new Error('User-allowance-first script reply is not an array');
  }

  const [userAllowanceConsumed, workspaceAllowanceConsumed, userShare] = [
    reply[0],
    reply[1],
    reply[2],
  ].map(toNumberOrNull);

  if (userShare === null) {
    return { userShare, userAllowanceConsumed, workspaceAllowanceConsumed };
  }

  if (userAllowanceConsumed === null) {
    throw new Error(
      'User-allowance-first script reply has a user share without a user allowance counter value',
    );
  }

  return { userShare, userAllowanceConsumed, workspaceAllowanceConsumed };
};
