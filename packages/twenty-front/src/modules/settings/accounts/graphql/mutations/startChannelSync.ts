import gql from 'graphql-tag';

export const START_CHANNEL_SYNC = gql`
  mutation StartChannelSync($connectedAccountId: UUID!) {
    startChannelSync(connectedAccountId: $connectedAccountId) {
      success
    }
  }
`;
