import { Button } from '@react-email/button';
import * as React from 'react';

const callToActionStyle = {
  display: 'flex',
  padding: '8px 32px',
  borderRadius: '8px',
  border: '1px solid var(--Transparent-Light, rgba(0, 0, 0, 0.04))',
  background: 'radial-gradient(50% 62.62% at 50% 0%, #505050 0%, #333 100%)',
  boxShadow:
    '0px 2px 4px 0px rgba(0, 0, 0, 0.04), 0px 0px 4px 0px rgba(0, 0, 0, 0.08)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 600,
};

export const CallToAction = ({ value, href }) => {
  return (
    <Button href={href} style={callToActionStyle}>
      {value}
    </Button>
  );
};
