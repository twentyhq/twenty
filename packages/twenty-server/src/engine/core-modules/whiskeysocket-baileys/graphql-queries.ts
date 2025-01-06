export const FindManyWorkspaceMembers = `
query FindManyWorkspaceMembers($filter: WorkspaceMemberFilterInput, $orderBy: [WorkspaceMemberOrderByInput], $lastCursor: String, $limit: Int) {
  workspaceMembers(
    filter: $filter
    orderBy: $orderBy
    first: $limit
    after: $lastCursor
  ) {
    edges {
      node {
        __typename
        name {
          firstName
          lastName
          __typename
        }
        avatarUrl
        id
        userEmail
        colorScheme
        createdAt
        phoneNumber
        locale
        userId
        updatedAt
      }
    }
  }
}
`;

export const graphqlToFetchWhatsappMessageByWhatsappId = `
query FindOneWhatsappMessage($whatsappMessageId: String!) {
  whatsappMessage(filter: {whatsappMessageId: {eq: $whatsappMessageId}}) {
    id
    candidateId
    whatsappMessageId
    message
    messageObj
  }
}
`;

export const graphqlToUpdateWhatsappMessageId = `
mutation UpdateOneWhatsappMessage($idToUpdate: ID!, $input: WhatsappMessageUpdateInput!) {
  updateWhatsappMessage(id: $idToUpdate, data: $input) {
   id
   createdAt
   updatedAt
  }
}
`;

export const graphqlToFetchWhatsappMessageByCandidateId = `
query FindManyWhatsappMessages($filter: WhatsappMessageFilterInput, $orderBy: [WhatsappMessageOrderByInput], $lastCursor: String, $limit: Int) {
  whatsappMessages(
    filter: $filter
    orderBy: $orderBy
    first: $limit
    after: $lastCursor
  ) {
    edges {
      node {
        __typename
        updatedAt
        candidateId
        position
        whatsappDeliveryStatus
        whatsappMessageId
        phoneFrom
        createdAt
        message
        audioFilePath
        id
        name
        recruiterId
        messageObj
        phoneTo
        jobsId
        typeOfMessage
        whatsappProvider
      }
    }
  }
}
`;
