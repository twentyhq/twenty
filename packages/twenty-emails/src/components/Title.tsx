import { type JSX } from 'react';
import { Heading } from 'react-email';

import { canvasTheme } from 'src/common-style';

type TitleProps = {
  value: JSX.Element | JSX.Element[] | string;
};

const titleStyle = {
  fontFamily: canvasTheme.font.family,
  fontSize: canvasTheme.font.size.xl,
  fontWeight: canvasTheme.font.weight.bold,
  color: canvasTheme.font.colors.highlighted,
};

export const Title = ({ value }: TitleProps) => {
  return (
    <Heading style={titleStyle} as="h1">
      {value}
    </Heading>
  );
};
