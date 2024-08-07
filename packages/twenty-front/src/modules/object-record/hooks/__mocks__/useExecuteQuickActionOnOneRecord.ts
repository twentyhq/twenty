import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
import { gql } from '@apollo/client';

export { responseData } from './useUpdateOneRecord';

export const query = gql`
  mutation ExecuteQuickActionOnOnePerson($idToExecuteQuickActionOn: ID!) {
    executeQuickActionOnPerson(id: $idToExecuteQuickActionOn) {
      ${PERSON_FRAGMENT}
    }
  }
`;

export const variables = {
  idToExecuteQuickActionOn: 'a7286b9a-c039-4a89-9567-2dfa7953cda9',
};
