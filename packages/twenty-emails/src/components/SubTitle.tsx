import { Heading } from '@react-email/components';

import { emailTheme } from 'src/common-style';

type SubTitleProps = {
  value: JSX.Element | JSX.Element[] | string;
};

export const SubTitle = ({ value }: SubTitleProps) => {
  const subTitleStyle = {
    fontFamily: emailTheme.font.family,
    fontSize: emailTheme.font.size.lg,
    fontWeight: emailTheme.font.weight.bold,
    color: emailTheme.font.colors.highlighted,
  } as const;

  return (
    <Heading style={subTitleStyle} as="h3">
      {value}
    </Heading>
  );
};
