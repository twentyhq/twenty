import gql from 'graphql-tag';

export const FIND_ADD_PEOPLE_TO_MESSAGE_LIST_JOB_STATUS = gql`
  query FindAddPeopleToMessageListJobStatus($messageListId: UUID!) {
    findAddPeopleToMessageListJobStatus(messageListId: $messageListId) {
      jobId
      state
      failedReason
    }
  }
`;
