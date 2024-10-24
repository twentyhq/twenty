import { gql } from '@apollo/client';

export const COMPUTE_STEP_SETTING_OUTPUT_SCHEMA = gql`
  mutation ComputeStepSettingOutputSchema(
    $input: ComputeStepSettingOutputSchemaInput!
  ) {
    computeStepSettingOutputSchema(input: $input)
  }
`;
