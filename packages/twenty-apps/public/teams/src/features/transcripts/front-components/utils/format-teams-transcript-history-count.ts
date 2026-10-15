export const formatTeamsTranscriptHistoryCount = ({
  count,
  locale,
}: {
  count: number;
  locale: string;
}): string => count.toLocaleString(locale);
