import { MILLISECONDS_PER_DAY } from 'src/features/transcripts/logic-functions/constants/milliseconds-per-day';
import { TEAMS_TRANSCRIPT_HISTORY_CHUNK_DAYS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-chunk-days';
import { type TeamsMeetingWindow } from 'src/features/transcripts/logic-functions/types/teams-meeting-window.type';

export const getTeamsTranscriptHistoryChunkWindow = ({
  windowStart,
  windowEnd,
  chunkIndex,
}: {
  windowStart: string;
  windowEnd: string;
  chunkIndex: number;
}): TeamsMeetingWindow | undefined => {
  const chunkMilliseconds =
    TEAMS_TRANSCRIPT_HISTORY_CHUNK_DAYS * MILLISECONDS_PER_DAY;
  const windowStartMilliseconds = Date.parse(windowStart);
  const chunkEndMilliseconds =
    Date.parse(windowEnd) - chunkIndex * chunkMilliseconds;

  if (chunkEndMilliseconds <= windowStartMilliseconds) {
    return undefined;
  }

  return {
    startDateTime: new Date(
      Math.max(
        windowStartMilliseconds,
        chunkEndMilliseconds - chunkMilliseconds,
      ),
    ).toISOString(),
    endDateTime: new Date(chunkEndMilliseconds).toISOString(),
  };
};
