import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_DOC_ORDERED_GLYPH_TYPES } from 'src/logic-functions/constants/google-docs-api.constant';
import { type GoogleDocLists } from 'src/logic-functions/types/google-doc-lists.type';
import { type GoogleDocParagraph } from 'src/logic-functions/types/google-doc-paragraph.type';
import { buildGoogleDocMarkdownSegment } from 'src/logic-functions/utils/build-google-doc-markdown-segment.util';
import { joinGoogleDocMarkdownSegments } from 'src/logic-functions/utils/join-google-doc-markdown-segments.util';

const HEADING_STYLE_PATTERN = /^HEADING_([1-6])$/;

const getHeadingPrefix = (namedStyleType: string | undefined): string => {
  if (namedStyleType === 'TITLE') {
    return '# ';
  }

  const headingLevel = HEADING_STYLE_PATTERN.exec(namedStyleType ?? '')?.[1];

  return isDefined(headingLevel) ? `${'#'.repeat(Number(headingLevel))} ` : '';
};

const getBulletPrefix = ({
  bullet,
  lists,
}: {
  bullet: GoogleDocParagraph['bullet'];
  lists: GoogleDocLists;
}): string => {
  if (!isDefined(bullet)) {
    return '';
  }

  const nestingLevel = bullet.nestingLevel ?? 0;
  const indentation = '    '.repeat(nestingLevel);
  const glyphType =
    lists[bullet.listId]?.listProperties?.nestingLevels?.[nestingLevel]
      ?.glyphType;

  if (isDefined(glyphType) && GOOGLE_DOC_ORDERED_GLYPH_TYPES.has(glyphType)) {
    return `${indentation}1. `;
  }

  return `${indentation}- `;
};

export const convertGoogleDocParagraphToMarkdown = ({
  paragraph,
  lists,
}: {
  paragraph: GoogleDocParagraph;
  lists: GoogleDocLists;
}): string | undefined => {
  const text = joinGoogleDocMarkdownSegments(
    (paragraph.elements ?? []).map(buildGoogleDocMarkdownSegment),
  ).trim();

  if (!isNonEmptyString(text)) {
    return undefined;
  }

  return `${getBulletPrefix({ bullet: paragraph.bullet, lists })}${getHeadingPrefix(paragraph.paragraphStyle?.namedStyleType)}${text}`;
};
