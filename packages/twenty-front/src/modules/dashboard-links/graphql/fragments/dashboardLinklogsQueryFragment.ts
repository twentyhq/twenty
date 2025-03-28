import { gql } from '@apollo/client';

export const DASHBOARD_LINKLOGS_QUERY_FRAGMENT = gql`
  fragment DashboardLinklogsQueryFragment on LinkLogsWorkspaceEntity {
    product
    linkName
    uv
    linkId
    utmSource
    utmMedium
    utmCampaign
    userIp
    userAgent
  }
`;
