import { type JSX } from 'react';
import { Heading } from 'react-email';

import { canvasTheme } from 'src/common-style';

type SubTitleProps = {
  value: JSX.Element | JSX.Element[] | string;
};

const subTitleStyle = {
  fontFamily: canvasTheme.font.family,
  fontSize: canvasTheme.font.size.lg,
  fontWeight: canvasTheme.font.weight.bold,
  color: canvasTheme.font.colors.highlighted,
};

export const SubTitle = ({ value }: SubTitleProps) => {
  return (
    <Heading style={subTitleStyle} as="h3">
      {value}
    </Heading>
  );
};
