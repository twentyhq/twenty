import { Text } from '@react-email/text';
import { ReactNode } from 'react';

import { emailTheme } from 'src/common-style';

const highlightedStyle = {
  borderRadius: emailTheme.border.radius.sm,
  background: emailTheme.background.colors.highlight,
  padding: '4px 8px',
  fontSize: emailTheme.font.size.lg,
  fontWeight: emailTheme.font.weight.bold,
  color: emailTheme.font.colors.highlighted,
};

type HighlightedTextProps = {
  value: ReactNode;
  centered?: boolean;
};

export const HighlightedText = ({ value }: HighlightedTextProps) => {
  return <Text style={highlightedStyle}>{value}</Text>;
};
