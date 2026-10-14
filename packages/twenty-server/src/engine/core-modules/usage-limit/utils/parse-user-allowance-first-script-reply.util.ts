import { isDefined } from 'twenty-shared/utils';

const toNumberOrNull = (value: unknown): number | null =>
  typeof value === 'number' ? value : null;

export const parseUserAllowanceFirstScriptReply = ({
  reply,
  userAllowanceCount,
}: {
  reply: unknown;
  userAllowanceCount: number;
}):
  | {
      userShare: number;
      userAllowanceConsumedValues: number[];
      workspaceAllowanceConsumed: number | null;
    }
  | {
      userShare: null;
      userAllowanceConsumedValues: (number | null)[];
      workspaceAllowanceConsumed: number | null;
    } => {
  if (!Array.isArray(reply)) {
    throw new Error('User-allowance-first script reply is not an array');
  }

  const userShare = toNumberOrNull(reply[0]);
  const workspaceAllowanceConsumed = toNumberOrNull(reply[1]);
  const userAllowanceConsumedValues = Array.from(
    { length: userAllowanceCount },
    (_, index) => toNumberOrNull(reply[index + 2]),
  );

  if (userShare === null) {
    return {
      userShare,
      userAllowanceConsumedValues,
      workspaceAllowanceConsumed,
    };
  }

  if (!userAllowanceConsumedValues.every(isDefined)) {
    throw new Error(
      'User-allowance-first script reply has a user share without every user allowance counter value',
    );
  }

  return {
    userShare,
    userAllowanceConsumedValues: userAllowanceConsumedValues.filter(isDefined),
    workspaceAllowanceConsumed,
  };
};
