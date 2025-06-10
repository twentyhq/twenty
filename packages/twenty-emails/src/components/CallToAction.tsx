import { Button } from '@react-email/components';

import { emailTheme } from 'src/common-style';

const callToActionStyle = {
  display: 'inline-flex',
  padding: '8px 32px',
  borderRadius: emailTheme.border.radius.md,
  border: `1px solid ${emailTheme.background.transparent.light}`,
  background: emailTheme.background.button,
  boxShadow: `0px 2px 4px 0px ${emailTheme.background.transparent.light}, 0px 0px 4px 0px ${emailTheme.background.transparent.medium}`,
  color: emailTheme.font.colors.inverted,
  fontSize: emailTheme.font.size.md,
  fontWeight: emailTheme.font.weight.bold,
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
