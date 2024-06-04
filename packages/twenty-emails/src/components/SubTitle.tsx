import { ReactNode } from 'react';
import { Heading } from '@react-email/components';

type SubTitleProps = {
  value: ReactNode;
};

export const SubTitle = ({ value }: SubTitleProps) => {
  return <Heading as="h4">{value}</Heading>;
};
