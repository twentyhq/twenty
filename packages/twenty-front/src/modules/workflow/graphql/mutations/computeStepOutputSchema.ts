import { gql } from '@apollo/client';

export const COMPUTE_STEP_OUTPUT_SCHEMA = gql`
  mutation ComputeStepOutputSchema($input: ComputeStepOutputSchemaInput!) {
    computeStepOutputSchema(input: $input)
  }
`;
