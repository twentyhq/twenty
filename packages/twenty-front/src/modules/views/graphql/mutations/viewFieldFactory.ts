import { gql } from '@apollo/client';
import { createViewFieldOperationFactory } from 'twenty-shared/mutations';

export const createViewField = gql`
  ${createViewFieldOperationFactory()}
`;
