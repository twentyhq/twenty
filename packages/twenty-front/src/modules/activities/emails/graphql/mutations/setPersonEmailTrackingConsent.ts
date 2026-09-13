import gql from 'graphql-tag';

export const SET_PERSON_EMAIL_TRACKING_CONSENT = gql`
  mutation SetPersonEmailTrackingConsent(
    $input: SetPersonEmailTrackingConsentInput!
  ) {
    setPersonEmailTrackingConsent(input: $input)
  }
`;
