import { gql } from '@apollo/client';

export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $commentId: String!
    $commentText: String!
    $authorId: String!
    $commentThreadId: String!
    $createdAt: DateTime!
  ) {
    createOneComment(
      data: {
        id: $commentId
        createdAt: $createdAt
        body: $commentText
        author: { connect: { id: $authorId } }
        commentThread: { connect: { id: $commentThreadId } }
      }
    ) {
      id
      createdAt
      body
      author {
        id
        displayName
        avatarUrl
      }
      commentThreadId
    }
  }
`;
