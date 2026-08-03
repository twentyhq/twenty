import gql from 'graphql-tag';

export const GET_PERSON_DUPLICATE_GROUPS = gql`
  query GetPersonDuplicateGroups {
    personDuplicateGroups {
      totalCount
      canResolve
      groups {
        id
        reasons
        detectedAt
        people {
          id
          firstName
          lastName
          emails
          phones {
            number
            countryCode
            callingCode
          }
          linkedinLinks {
            label
            url
          }
          jobTitle
          company {
            id
            name
          }
          avatarUrl
          createdByName
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const KEEP_PERSON_DUPLICATE_RECORDS_SEPARATE = gql`
  mutation KeepPersonDuplicateRecordsSeparate(
    $pairs: [PersonDuplicatePairInput!]!
  ) {
    keepPersonDuplicateRecordsSeparate(pairs: $pairs)
  }
`;
