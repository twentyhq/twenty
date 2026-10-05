import { Text } from 'react-email';
import { type JSX } from 'react';

import { canvasTheme } from 'src/common-style';

const highlightedStyle = {
  borderRadius: canvasTheme.border.radius.sm,
  background: canvasTheme.background.colors.highlight,
  padding: '4px 8px',
  fontSize: canvasTheme.font.size.lg,
  fontWeight: canvasTheme.font.weight.bold,
  color: canvasTheme.font.colors.highlighted,
};

type HighlightedTextProps = {
  value: JSX.Element | JSX.Element[] | string | undefined;
  centered?: boolean;
};

export const HighlightedText = ({ value }: HighlightedTextProps) => {
  return <Text style={highlightedStyle}>{value}</Text>;
};
