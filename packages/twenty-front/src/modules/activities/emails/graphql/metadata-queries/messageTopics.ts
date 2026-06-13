import { gql } from '@apollo/client';

export const MESSAGE_TOPICS = gql`
  query MessageTopics {
    messageTopics {
      id
      name
      description
      visibility
    }
  }
`;
