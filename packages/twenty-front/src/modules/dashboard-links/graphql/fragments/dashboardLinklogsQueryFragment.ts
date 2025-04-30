import { gql } from '@apollo/client';

export const DASHBOARD_LINKLOGS_QUERY_FRAGMENT = gql`
  fragment DashboardLinklogsQueryFragment on LinkLogsWorkspaceEntity {
    product
    linkName
    linkId
    utmSource
    utmMedium
    utmCampaign
    userIp
    userAgent
  }
`;
