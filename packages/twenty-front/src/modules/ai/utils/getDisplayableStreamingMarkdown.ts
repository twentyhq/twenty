const CODE_FENCE_LINE_REGEX = /^\s*(```|~~~)/gm;
const TABLE_DELIMITER_LINE_REGEX = /^\s*\|?\s*:?-{3,}/m;
const UNFINISHED_LINK_REGEX = /^\[[^\]]*(\]\([^)]*)?$/;

const hideFrom = (text: string, index: number) =>
  text.slice(0, index).trimEnd();

const countOccurrences = (text: string, token: string) =>
  text.split(token).length - 1;

// Text cut mid-stream would flash raw syntax, so hide what cannot render yet and close what can.
export const getDisplayableStreamingMarkdown = (text: string): string => {
  const codeFenceLineCount = text.match(CODE_FENCE_LINE_REGEX)?.length ?? 0;

  if (codeFenceLineCount % 2 === 1) {
    return text;
  }

  const lastBlankLineIndex = text.lastIndexOf('\n\n');
  const lastBlockStart = lastBlankLineIndex === -1 ? 0 : lastBlankLineIndex + 2;
  const lastBlock = text.slice(lastBlockStart);

  // a table header renders as a paragraph until its delimiter row arrives
  if (
    lastBlock.trimStart().startsWith('|') &&
    !TABLE_DELIMITER_LINE_REGEX.test(lastBlock)
  ) {
    return hideFrom(text, lastBlockStart);
  }

  let displayableText = text;

  const chatReferenceStart = displayableText.lastIndexOf('[[');

  if (chatReferenceStart > displayableText.lastIndexOf(']]')) {
    displayableText = hideFrom(displayableText, chatReferenceStart);
  }

  const lastLineStart = displayableText.lastIndexOf('\n') + 1;
  const linkStart = displayableText.lastIndexOf('[');

  if (
    linkStart >= lastLineStart &&
    UNFINISHED_LINK_REGEX.test(displayableText.slice(linkStart))
  ) {
    const isImage = displayableText[linkStart - 1] === '!';

    displayableText = hideFrom(
      displayableText,
      isImage ? linkStart - 1 : linkStart,
    );
  }

  const lastLine = displayableText.slice(lastLineStart);

  if (countOccurrences(lastLine, '`') % 2 === 1) {
    const inlineCodeStart = displayableText.lastIndexOf('`');

    return inlineCodeStart === displayableText.length - 1
      ? hideFrom(displayableText, inlineCodeStart)
      : `${displayableText}\``;
  }

  const lastLineWithoutInlineCode = lastLine.replace(/`[^`]*`/g, '');

  if (countOccurrences(lastLineWithoutInlineCode, '**') % 2 === 1) {
    const boldStart = displayableText.lastIndexOf('**');

    return displayableText.slice(boldStart + 2).trim() === ''
      ? hideFrom(displayableText, boldStart)
      : `${displayableText.trimEnd()}**`;
  }

  return displayableText;
};
