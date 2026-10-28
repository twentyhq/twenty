const CODE_FENCE_LINE_REGEX = /^\s*(```|~~~)/;
const TABLE_DELIMITER_LINE_REGEX = /^\s*\|?\s*:?-{3,}/m;
const UNFINISHED_LINK_REGEX = /^\[[^\]]*(\]\([^)]*)?$/;

const hideFrom = ({ text, index }: { text: string; index: number }) =>
  text.slice(0, index).trimEnd();

const countOccurrences = ({ text, token }: { text: string; token: string }) =>
  text.split(token).length - 1;

// Text cut mid-stream would flash raw syntax, so hide what cannot render yet and close what can.
export const getDisplayableStreamingMarkdown = (text: string): string => {
  const codeFenceLineCount = text
    .split('\n')
    .filter((line) => CODE_FENCE_LINE_REGEX.test(line)).length;

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
    return hideFrom({ text, index: lastBlockStart });
  }

  const lastLineStart = text.lastIndexOf('\n') + 1;

  if (CODE_FENCE_LINE_REGEX.test(text.slice(lastLineStart))) {
    return text;
  }

  // code spans, including one still open, cannot hold references or links
  const lastLineOutsideCode = text
    .slice(lastLineStart)
    .replace(/`[^`]*`?/g, (code) => ' '.repeat(code.length));
  const chatReferenceStart = lastLineOutsideCode.lastIndexOf('[[');
  const linkStart = lastLineOutsideCode.lastIndexOf('[');

  let displayableText = text;

  if (chatReferenceStart > lastLineOutsideCode.lastIndexOf(']]')) {
    displayableText = hideFrom({
      text,
      index: lastLineStart + chatReferenceStart,
    });
  } else if (
    linkStart !== -1 &&
    UNFINISHED_LINK_REGEX.test(lastLineOutsideCode.slice(linkStart))
  ) {
    const isImage = lastLineOutsideCode[linkStart - 1] === '!';

    displayableText = hideFrom({
      text,
      index: lastLineStart + (isImage ? linkStart - 1 : linkStart),
    });
  }

  const lastLine = displayableText.slice(lastLineStart);

  if (countOccurrences({ text: lastLine, token: '`' }) % 2 === 1) {
    const inlineCodeStart = displayableText.lastIndexOf('`');

    return inlineCodeStart === displayableText.length - 1
      ? hideFrom({ text: displayableText, index: inlineCodeStart })
      : `${displayableText}\``;
  }

  const lastLineWithoutInlineCode = lastLine.replace(/`[^`]*`/g, '');

  if (
    countOccurrences({ text: lastLineWithoutInlineCode, token: '**' }) % 2 ===
    1
  ) {
    const boldStart = displayableText.lastIndexOf('**');

    return displayableText.slice(boldStart + 2).trim() === ''
      ? hideFrom({ text: displayableText, index: boldStart })
      : `${displayableText.trimEnd()}**`;
  }

  return displayableText;
};
