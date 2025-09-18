import { Heading } from '@react-email/components';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/nodes/render-node';
import { isDefined } from 'twenty-shared/utils';

export const heading = (node: JSONContent): ReactNode => {
  const { level } = node?.attrs || {};
  if (!isDefined(level)) {
    return null;
  }

  const content = mappedNodeContent(node);
  if (level === 1) {
    return (
      <Heading as="h1" style={{ fontSize: '36px' }}>
        {content}
      </Heading>
    );
  }

  if (level === 2) {
    return (
      <Heading as="h2" style={{ fontSize: '30px' }}>
        {content}
      </Heading>
    );
  }

  if (level === 3) {
    return (
      <Heading as="h3" style={{ fontSize: '24px' }}>
        {content}
      </Heading>
    );
  }
};
