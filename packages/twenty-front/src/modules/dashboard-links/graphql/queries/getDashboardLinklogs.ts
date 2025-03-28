import { DASHBOARD_LINKLOGS_QUERY_FRAGMENT } from '@/dashboard-links/graphql/fragments/dashboardLinklogsQueryFragment';
import { gql } from '@apollo/client';

export const GET_DASHBOARD_LINKLOGS = gql`
  ${DASHBOARD_LINKLOGS_QUERY_FRAGMENT}

  query GetDashboardLinklogs {
    getDashboardLinklogs {
      ...DashboardLinklogsQueryFragment
    }
  }
`;
