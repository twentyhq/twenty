import { isNonEmptyString } from '@sniptt/guards';

import { type GoogleDocMarkdownSegment } from 'src/logic-functions/types/google-doc-markdown-segment.type';
import { splitSurroundingWhitespace } from 'src/logic-functions/utils/split-surrounding-whitespace.util';

const BOLD_MARKER = '**';
const ITALIC_MARKER = '*';

type JoinedMarkdown = {
  markdown: string;
  isBold: boolean;
  isItalic: boolean;
};

const closeMarkerBeforeTrailingWhitespace = ({
  markdown,
  marker,
  shouldClose,
}: {
  markdown: string;
  marker: string;
  shouldClose: boolean;
}): string => {
  if (!shouldClose) {
    return markdown;
  }

  const { trailing } = splitSurroundingWhitespace(markdown);

  return `${markdown.slice(0, markdown.length - trailing.length)}${marker}${trailing}`;
};

const switchEmphasis = ({
  joined,
  isBold,
  isItalic,
}: {
  joined: JoinedMarkdown;
  isBold: boolean;
  isItalic: boolean;
}): { closedMarkdown: string; openingMarkers: string } => {
  const shouldCloseBold =
    joined.isBold && (!isBold || joined.isItalic !== isItalic);
  const shouldOpenItalic = isItalic && !joined.isItalic;
  const shouldOpenBold = isBold && (!joined.isBold || shouldCloseBold);
  const closedMarkdown = closeMarkerBeforeTrailingWhitespace({
    markdown: closeMarkerBeforeTrailingWhitespace({
      markdown: joined.markdown,
      marker: BOLD_MARKER,
      shouldClose: shouldCloseBold,
    }),
    marker: ITALIC_MARKER,
    shouldClose: joined.isItalic && !isItalic,
  });

  return {
    closedMarkdown,
    openingMarkers: `${shouldOpenItalic ? ITALIC_MARKER : ''}${shouldOpenBold ? BOLD_MARKER : ''}`,
  };
};

const appendSegment = ({
  joined,
  segment,
}: {
  joined: JoinedMarkdown;
  segment: GoogleDocMarkdownSegment;
}): JoinedMarkdown => {
  const { leading, content, trailing } = splitSurroundingWhitespace(
    segment.markdown,
  );

  if (!isNonEmptyString(content)) {
    return { ...joined, markdown: `${joined.markdown}${segment.markdown}` };
  }

  const isBold = segment.isBold ?? false;
  const isItalic = segment.isItalic ?? false;
  const { closedMarkdown, openingMarkers } = switchEmphasis({
    joined,
    isBold,
    isItalic,
  });

  return {
    markdown: `${closedMarkdown}${leading}${openingMarkers}${content}${trailing}`,
    isBold,
    isItalic,
  };
};

export const joinGoogleDocMarkdownSegments = (
  segments: GoogleDocMarkdownSegment[],
): string => {
  const joined = segments.reduce<JoinedMarkdown>(
    (joinedSoFar, segment) => appendSegment({ joined: joinedSoFar, segment }),
    { markdown: '', isBold: false, isItalic: false },
  );

  return switchEmphasis({ joined, isBold: false, isItalic: false })
    .closedMarkdown;
};
