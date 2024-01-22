import * as React from 'react';
import { Column } from '@react-email/components';
import { Row } from '@react-email/row';
import { Text } from '@react-email/text';
import { emailTheme } from 'src/common-style';

const rowStyle = {
  display: 'flex',
};

const highlightedStyle = {
  borderRadius: '4px',
  background: emailTheme.background.colors.highlight,
  padding: '4px 8px',
  margin: 0,
  fontSize: emailTheme.font.size.lg,
  fontWeight: emailTheme.font.weight.bold,
  color: emailTheme.font.colors.highlighted,
};

export const HighlightedText = ({ value }) => {
  return (
    <Row style={rowStyle}>
      <Column>
        <Text style={highlightedStyle}>{value}</Text>
      </Column>
    </Row>
  );
};
