const GRAPHEME_SEGMENTER = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
});

export const truncateOnGraphemeBoundary = ({
  text,
  maxLength,
}: {
  text: string;
  maxLength: number;
}): string => {
  if (text.length <= maxLength) {
    return text;
  }

  // Slack counts the characters it stores, so the budget is code units, cut on
  // grapheme boundaries to keep sequences such as 👨‍👩‍👧‍👦 whole
  return [...GRAPHEME_SEGMENTER.segment(text)]
    .filter(({ index, segment }) => index + segment.length <= maxLength)
    .map(({ segment }) => segment)
    .join('');
};
