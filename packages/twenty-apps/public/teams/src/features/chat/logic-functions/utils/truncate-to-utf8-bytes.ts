const GRAPHEME_SEGMENTER = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
});

const UTF8_ENCODER = new TextEncoder();

export const countUtf8Bytes = (text: string): number =>
  UTF8_ENCODER.encode(text).length;

export const truncateToUtf8Bytes = ({
  text,
  maxBytes,
}: {
  text: string;
  maxBytes: number;
}): string => {
  if (countUtf8Bytes(text) <= maxBytes) {
    return text;
  }

  let usedBytes = 0;
  let keptText = '';

  for (const { segment } of GRAPHEME_SEGMENTER.segment(text)) {
    usedBytes += countUtf8Bytes(segment);

    if (usedBytes > maxBytes) {
      break;
    }

    keptText += segment;
  }

  return keptText;
};
