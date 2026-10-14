export const formatTeamsTranscriptHistoryDate = ({
  date,
  locale,
}: {
  date: string;
  locale: string;
}): string => new Date(date).toLocaleDateString(locale);
