import { type TeamsDirectoryMatchSummary } from 'src/features/chat/logic-functions/types/teams-directory-match.type';

export const buildTeamsDirectoryMatchMessage = ({
  linkedCount,
  alreadyLinkedCount,
  unmatchedCount,
  ambiguousEmailCount,
  failedCount,
  isDirectoryTruncated,
}: TeamsDirectoryMatchSummary): string => {
  const messageParts = [
    `Matched ${linkedCount} Teams ${linkedCount === 1 ? 'user' : 'users'} by email.`,
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

  if (isDirectoryTruncated) {
    messageParts.push(
      'The organization directory is too large to scan in one pass, so some users were not checked.',
    );
  }

  return messageParts.join(' ');
};
