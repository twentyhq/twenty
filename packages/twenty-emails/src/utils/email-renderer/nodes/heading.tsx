import { Heading } from '@react-email/components';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
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

export const heading = (node: JSONContent): ReactNode => {
  const { level } = node?.attrs || {};

  if (!isDefined(level) || !HEADING_STYLES[level as HeadingLevel]) {
    return null;
  }

  const content = mappedNodeContent(node);
  const { element, fontSize } = HEADING_STYLES[level as HeadingLevel];

  return (
    <Heading as={element} style={{ fontSize }}>
      {content}
    </Heading>
  );
};
