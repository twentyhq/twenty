import { gql } from '@apollo/client';

export const SUBMIT_FORM_STEP = gql`
  mutation SubmitFormStep($input: SubmitFormStepInput!) {
    submitFormStep(input: $input)
  }
`;
