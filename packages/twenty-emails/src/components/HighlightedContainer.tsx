import React, { PropsWithChildren } from 'react';
import { Container } from '@react-email/components';

import { emailTheme } from 'src/common-style';

type HighlightedContainerProps = PropsWithChildren;

const highlightedContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: emailTheme.background.colors.highlight,
  border: `1px solid ${emailTheme.border.color.highlighted}`,
  borderRadius: emailTheme.border.radius.md,
  padding: '24px 48px',
  gap: '24px',
};

const divStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
} as React.CSSProperties;

export const HighlightedContainer = ({
  children,
}: HighlightedContainerProps) => {
  return (
    <Container style={highlightedContainerStyle}>
      <div style={divStyle}>{children}</div>
    </Container>
  );
};
