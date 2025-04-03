import { Heading } from '@react-email/components';

import { emailTheme } from 'src/common-style';

type SubTitleProps = {
  value: JSX.Element | JSX.Element[] | string;
};

const subTitleStyle = {
  fontFamily: emailTheme.font.family,
  fontSize: emailTheme.font.size.lg,
  fontWeight: emailTheme.font.weight.bold,
  color: emailTheme.font.colors.highlighted,
};

export const SubTitle = ({ value }: SubTitleProps) => {
  return (
    <Heading style={subTitleStyle} as="h3">
      {value}
    </Heading>
  );
};
