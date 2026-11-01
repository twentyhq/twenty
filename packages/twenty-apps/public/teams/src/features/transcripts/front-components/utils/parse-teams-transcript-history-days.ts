import { TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-max-days';

export const parseTeamsTranscriptHistoryDays = (
  value: string,
): number | undefined => {
  if (!/^\d+$/.test(value.trim())) {
    return undefined;
  }

  const days = Number(value);

  return days >= 1 && days <= TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS
    ? days
    : undefined;
};
