import { Section } from 'react-email';
import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { mappedNodeContent } from 'src/utils/email-renderer/renderers/render-node';
import { blockStyle } from 'src/utils/email-renderer/utils/block-style';
import {
  type InheritedTypography,
  mergeInheritedTypography,
} from 'src/utils/email-renderer/utils/inherited-typography';

export const section = (
  node: JSONContent,
  inherited: InheritedTypography = {},
): ReactNode => {
  const style = blockStyle(node.attrs?.style);

  return (
    <Section style={style}>
      {mappedNodeContent(node, mergeInheritedTypography(inherited, style))}
    </Section>
  );
};
