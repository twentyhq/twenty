import { ReactNode } from 'react';
import { Heading } from '@react-email/components';

import { emailTheme } from 'src/common-style';

type TitleProps = {
  value: ReactNode;
};

const titleStyle = {
  fontFamily: emailTheme.font.family,
  fontSize: emailTheme.font.size.xl,
  fontWeight: emailTheme.font.weight.bold,
  color: emailTheme.font.colors.highlighted,
};

export const Title = ({ value }: TitleProps) => {
  return (
    <Heading style={titleStyle} as="h1">
      {value}
    </Heading>
  );
};
