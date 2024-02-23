import gql from "graphql-tag";

gql`
  query FindOnemessageChannel($objectRecordId: UUID!) {
    messageChannel(filter: { id: { eq: $objectRecordId } }) {
      id
      visibility
      messageThreads {
        edges {
          node {
            __typename
            id
          }
          __typename
        }
        __typename
      }
      createdAt
      type
      updatedAt
      id
      connectedAccountId
      handle
      connectedAccount {
        __typename
        id
        handle
        updatedAt
        accessToken
        messageChannels {
          edges {
            node {
              __typename
              id
            }
            __typename
          }
          __typename
        }
        refreshToken
        accountOwner {
          __typename
          id
        }
        provider
        id
        createdAt
        accountOwnerId
      }
      __typename
    }
  }
`;
