import { ReactNode } from 'react';
import { Heading } from '@react-email/components';

type TitleProps = {
  value: ReactNode;
};

export const Title = ({ value }: TitleProps) => {
  return <Heading as="h1">{value}</Heading>;
};
