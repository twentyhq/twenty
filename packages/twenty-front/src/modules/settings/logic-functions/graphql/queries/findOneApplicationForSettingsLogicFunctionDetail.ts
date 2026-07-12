import { gql } from '@apollo/client';

export const FIND_ONE_APPLICATION_FOR_SETTINGS_LOGIC_FUNCTION_DETAIL = gql`
  query FindOneApplicationForSettingsLogicFunctionDetail($id: UUID!) {
    findOneApplication(id: $id) {
      id
      name
      functionsBaseUrl
      applicationVariables {
        key
      }
    }
  }
`;
