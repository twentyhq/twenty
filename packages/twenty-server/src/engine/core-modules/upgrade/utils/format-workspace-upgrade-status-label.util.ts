import { isNonEmptyString } from '@sniptt/guards';

const ANONYMIZED_DISPLAY_NAME_VISIBLE_LENGTH = 3;
const ANONYMIZED_SUFFIX = '***';

type FormatWorkspaceUpgradeStatusLabelParams = {
  workspaceId: string;
  displayName: string | null;
  anonymize: boolean;
};

const anonymizeWorkspaceId = (workspaceId: string): string =>
  `${workspaceId.split('-')[0]}-${ANONYMIZED_SUFFIX}`;

const anonymizeDisplayName = (displayName: string): string =>
  `${Array.from(displayName).slice(0, ANONYMIZED_DISPLAY_NAME_VISIBLE_LENGTH).join('')}${ANONYMIZED_SUFFIX}`;

export const formatWorkspaceUpgradeStatusLabel = ({
  workspaceId,
  displayName,
  anonymize,
}: FormatWorkspaceUpgradeStatusLabelParams): string => {
  const formattedWorkspaceId = anonymize
    ? anonymizeWorkspaceId(workspaceId)
    : workspaceId;

  if (!isNonEmptyString(displayName)) {
    return formattedWorkspaceId;
  }

  const formattedDisplayName = anonymize
    ? anonymizeDisplayName(displayName)
    : displayName;

  return `${formattedDisplayName} (${formattedWorkspaceId})`;
};
