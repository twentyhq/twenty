const CARRIAGE_RETURN_LINE_FEED = '\r\n';

const SINGLE_ESCAPED_CHARACTER_LENGTH = 1;

type FindCssEscapeEndIndexInput = {
  cssText: string;
  escapeStartIndex: number;
};

export const findCssEscapeEndIndex = ({
  cssText,
  escapeStartIndex,
}: FindCssEscapeEndIndexInput): number => {
  const escapedCharacterIndex = escapeStartIndex + 1;
  const escapesCarriageReturnLineFeed = cssText.startsWith(
    CARRIAGE_RETURN_LINE_FEED,
    escapedCharacterIndex,
  );
  const escapedTextLength = escapesCarriageReturnLineFeed
    ? CARRIAGE_RETURN_LINE_FEED.length
    : SINGLE_ESCAPED_CHARACTER_LENGTH;

  return Math.min(escapedCharacterIndex + escapedTextLength, cssText.length);
};
