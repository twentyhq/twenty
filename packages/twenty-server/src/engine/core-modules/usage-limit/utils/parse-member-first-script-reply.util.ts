const toNumberOrNull = (value: unknown): number | null =>
  typeof value === 'number' ? value : null;

export const parseMemberFirstScriptReply = (
  reply: unknown,
):
  | {
      memberShare: number;
      memberConsumed: number;
      allowanceConsumed: number | null;
    }
  | {
      memberShare: null;
      memberConsumed: number | null;
      allowanceConsumed: number | null;
    } => {
  if (!Array.isArray(reply)) {
    throw new Error('Member-first script reply is not an array');
  }

  const [memberConsumed, allowanceConsumed, memberShare] = [
    reply[0],
    reply[1],
    reply[2],
  ].map(toNumberOrNull);

  if (memberShare === null) {
    return { memberShare, memberConsumed, allowanceConsumed };
  }

  if (memberConsumed === null) {
    throw new Error(
      'Member-first script reply has a member share without a member counter value',
    );
  }

  return { memberShare, memberConsumed, allowanceConsumed };
};
