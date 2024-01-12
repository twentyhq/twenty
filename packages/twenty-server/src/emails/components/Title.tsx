import { Heading } from '@react-email/components';
import * as React from 'react';

export const Title = ({ value }) => {
  return <Heading as="h1">{value}</Heading>;
};
