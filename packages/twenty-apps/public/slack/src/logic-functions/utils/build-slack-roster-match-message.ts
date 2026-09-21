import { type SlackRosterMatchSummary } from 'src/logic-functions/types/slack-roster-match.type';

export const buildSlackRosterMatchMessage = ({
  linkedCount,
  alreadyLinkedCount,
  unmatchedCount,
  ambiguousEmailCount,
  failedCount,
  isRosterTruncated,
}: SlackRosterMatchSummary): string => {
  const messageParts = [
    `Matched ${linkedCount} Slack ${linkedCount === 1 ? 'user' : 'users'} by email.`,
  ];

  if (alreadyLinkedCount > 0) {
    messageParts.push(`${alreadyLinkedCount} already linked.`);
  }

  if (unmatchedCount > 0) {
    messageParts.push(`${unmatchedCount} without a matching member email.`);
  }

  if (ambiguousEmailCount > 0) {
    messageParts.push(
      `${ambiguousEmailCount} skipped because their email belongs to more than one workspace member.`,
    );
  }

  if (failedCount > 0) {
    messageParts.push(
      `${failedCount} could not be linked; try the match again.`,
    );
  }

  if (isRosterTruncated) {
    messageParts.push(
      'The Slack roster is too large to scan in one pass, so some users were not checked.',
    );
  }

  return messageParts.join(' ');
};
