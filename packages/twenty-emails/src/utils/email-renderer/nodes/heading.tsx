import { Heading } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { type InheritedTypography } from 'src/utils/email-renderer/utils/inherited-typography';
import { isDefined } from 'twenty-shared/utils';

type HeadingLevel = 1 | 2 | 3;

type HeadingStyle = {
  element: 'h1' | 'h2' | 'h3';
  fontSize: string;
};

const HEADING_STYLES: Record<HeadingLevel, HeadingStyle> = {
  1: { element: 'h1', fontSize: '32px' },
  2: { element: 'h2', fontSize: '24px' },
  3: { element: 'h3', fontSize: '16px' },
};

export const heading = (
  node: JSONContent,
  inherited: InheritedTypography = {},
): ReactNode => {
  const { level } = node?.attrs || {};

  if (!isDefined(level) || !HEADING_STYLES[level as HeadingLevel]) {
    return null;
  }

  const content = mappedNodeContent(node, inherited);
  const { element, fontSize } = HEADING_STYLES[level as HeadingLevel];

  // A heading keeps its own scale; the section's colour, family and spacing
  // style it, otherwise every heading would collapse to body size.
  const { fontSize: _inheritedFontSize, ...inheritedWithoutSize } = inherited;

  return (
    <Heading as={element} style={{ fontSize, ...inheritedWithoutSize }}>
      {content}
    </Heading>
  );
};
