import gql from 'graphql-tag';

export const TRIGGER_ADD_PEOPLE_TO_MESSAGE_LIST_JOB = gql`
  mutation TriggerAddPeopleToMessageListJob(
    $input: TriggerAddPeopleToMessageListJobInput!
  ) {
    triggerAddPeopleToMessageListJob(input: $input) {
      jobId
    }
  }
`;
