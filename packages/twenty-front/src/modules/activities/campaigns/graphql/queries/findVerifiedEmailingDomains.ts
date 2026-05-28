import gql from 'graphql-tag';

// Uses the campaign-scoped query (gated by SEND_EMAIL_TOOL) rather than the
// settings-page query (gated by IS_EMAIL_GROUP_ENABLED) so the campaign drawer
// shows verified domains even when the unrelated email-group feature flag is
// off.
export const FIND_VERIFIED_EMAILING_DOMAINS = gql`
  query FindVerifiedEmailingDomainsForCampaigns {
    getCampaignEmailingDomains {
      id
      domain
      status
    }
  }
`;
