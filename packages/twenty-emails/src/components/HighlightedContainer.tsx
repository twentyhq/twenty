import { Column, Container, Row } from '@react-email/components';
import React, { PropsWithChildren } from 'react';

import { emailTheme } from 'src/common-style';

type HighlightedContainerProps = PropsWithChildren;

const highlightedContainerStyle = {
  background: emailTheme.background.colors.highlight,
  border: `1px solid ${emailTheme.border.color.highlighted}`,
  borderRadius: emailTheme.border.radius.md,
  padding: '24px 48px',
} as React.CSSProperties;

export const HighlightedContainer = ({
  children,
}: HighlightedContainerProps) => {
  return (
    <Container style={highlightedContainerStyle}>
      {React.Children.map(children, (child) => (
        <Row>
          <Column align="center">{child}</Column>
        </Row>
      ))}
    </Container>
  );
};
