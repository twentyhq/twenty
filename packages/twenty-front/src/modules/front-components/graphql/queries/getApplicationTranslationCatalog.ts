import gql from 'graphql-tag';

export const GET_APPLICATION_TRANSLATION_CATALOG = gql`
  query GetApplicationTranslationCatalog(
    $applicationId: UUID!
    $locale: String!
  ) {
    applicationTranslationCatalog(
      applicationId: $applicationId
      locale: $locale
    )
  }
`;
