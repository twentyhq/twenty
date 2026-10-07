const TEAMS_ASSISTANT_REQUEST_NAME_MAX_LENGTH = 60;

const graphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
});

const countCodePoints = (text: string): number => [...text].length;

export const buildTeamsAssistantRequestName = (requestText: string): string => {
  if (countCodePoints(requestText) <= TEAMS_ASSISTANT_REQUEST_NAME_MAX_LENGTH) {
    return requestText;
  }

  const { truncatedText } = Array.from(
    graphemeSegmenter.segment(requestText),
    ({ segment }) => segment,
  ).reduce(
    ({ truncatedText, isFull }, grapheme) =>
      isFull ||
      countCodePoints(truncatedText + grapheme) >=
        TEAMS_ASSISTANT_REQUEST_NAME_MAX_LENGTH
        ? { truncatedText, isFull: true }
        : { truncatedText: truncatedText + grapheme, isFull: false },
    { truncatedText: '', isFull: false },
  );

  return `${truncatedText}…`;
};
