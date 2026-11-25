import gql from 'graphql-tag';

export const MARK_APP_CHANNEL_THREAD_AS_READ = gql`
  mutation MarkAppChannelThreadAsRead(
    $input: MarkAppChannelThreadAsReadInput!
  ) {
    markAppChannelThreadAsRead(input: $input)
  }
`;
