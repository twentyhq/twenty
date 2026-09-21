import { type JSX } from 'react';
import { Button } from 'react-email';

import { canvasTheme } from 'src/common-style';

const callToActionStyle = {
  display: 'inline-flex',
  padding: '8px 32px',
  borderRadius: canvasTheme.border.radius.md,
  border: `1px solid ${canvasTheme.background.transparent.light}`,
  background: canvasTheme.background.button,
  boxShadow: `0px 2px 4px 0px ${canvasTheme.background.transparent.light}, 0px 0px 4px 0px ${canvasTheme.background.transparent.medium}`,
  color: canvasTheme.font.colors.inverted,
  fontSize: canvasTheme.font.size.md,
  fontWeight: canvasTheme.font.weight.bold,
  width: 'auto',
};

type CallToActionProps = {
  href: string;
  value: JSX.Element | JSX.Element[] | string;
};

export const CallToAction = ({ value, href }: CallToActionProps) => {
  return (
    <Button href={href} style={callToActionStyle}>
      {value}
    </Button>
  );
};
