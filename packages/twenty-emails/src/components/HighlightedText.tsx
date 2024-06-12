import React, { ReactNode } from 'react';
import { Text } from '@react-email/text';

import { emailTheme } from 'src/common-style';

const highlightedStyle = {
  borderRadius: emailTheme.border.radius.sm,
  background: emailTheme.background.colors.highlight,
  padding: '4px 8px',
  fontSize: emailTheme.font.size.lg,
  fontWeight: emailTheme.font.weight.bold,
  color: emailTheme.font.colors.highlighted,
};

const divStyle = {
  display: 'flex',
};

type HighlightedTextProps = {
  value: ReactNode;
  centered?: boolean;
};

export const HighlightedText = ({ value }: HighlightedTextProps) => {
  return (
    <div style={divStyle}>
      <Text style={highlightedStyle}>{value}</Text>
    </div>
  );
};
