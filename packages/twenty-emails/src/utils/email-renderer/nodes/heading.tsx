import { Heading } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { type EmailNodeRenderContext } from 'src/utils/email-renderer/utils/block-spacing';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';
import { EMAIL_TYPOGRAPHY, isDefined } from 'twenty-shared/utils';

type HeadingLevel = keyof typeof EMAIL_TYPOGRAPHY.headingFontSizes;

const HEADING_ELEMENTS: Record<HeadingLevel, 'h1' | 'h2' | 'h3'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
};

const isHeadingLevel = (level: unknown): level is HeadingLevel =>
  level === 1 || level === 2 || level === 3;

export const heading = (
  node: JSONContent,
  inherited: InheritedTypography,
  { isFirstChild, isLastChild }: EmailNodeRenderContext,
): ReactNode => {
  const level = node?.attrs?.level;

  if (!isDefined(level) || !isHeadingLevel(level)) {
    return null;
  }

  const content = mappedNodeContent(node, inherited);

  const {
    fontSize: _inheritedFontSize,
    fontWeight: _inheritedFontWeight,
    lineHeight: _inheritedLineHeight,
    ...inheritedTypography
  } = inherited;

  return (
    <Heading
      as={HEADING_ELEMENTS[level]}
      style={{
        fontSize: EMAIL_TYPOGRAPHY.headingFontSizes[level],
        fontWeight: EMAIL_TYPOGRAPHY.headingFontWeight,
        lineHeight: EMAIL_TYPOGRAPHY.headingLineHeight,
        marginTop: isFirstChild ? '0' : EMAIL_TYPOGRAPHY.headingSpacingTop,
        marginBottom: isLastChild ? '0' : EMAIL_TYPOGRAPHY.headingSpacingBottom,
        ...inheritedTypography,
        ...blockStyle(node.attrs?.style),
      }}
    >
      {content}
    </Heading>
  );
};
