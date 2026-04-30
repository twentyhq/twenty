import { gql, useQuery, useMutation } from '@apollo/client';

const GET_SECURITY_DASHBOARD = gql`
  query GetSecurityDashboard {
    securityDashboard {
      sessions {
        id
        deviceName
        deviceType
        browser
        ipAddress
        location
        lastActiveAt
        createdAt
        isCurrent
      }
      auditLog {
        id
        userId
        userName
        action
        resource
        details
        ipAddress
        createdAt
      }
      twoFactorStats {
        totalUsers
        enabledCount
        pendingCount
        disabledCount
        adoptionPercentage
      }
      twoFactorUsers {
        id
        name
        email
        twoFactorEnabled
        enrolledAt
      }
    }
  }
`;

const EXPORT_AUDIT_LOG = gql`
  mutation ExportAuditLog($dateFrom: String, $dateTo: String) {
    exportAuditLog(dateFrom: $dateFrom, dateTo: $dateTo) {
      downloadUrl
    }
  }
`;

const REVOKE_SESSION = gql`
  mutation RevokeSession($sessionId: String!) {
    revokeSession(sessionId: $sessionId) {
      success
    }
  }
`;

export const useSecurityDashboard = () => {
  const { data, loading, refetch } = useQuery(GET_SECURITY_DASHBOARD);

  return {
    sessions: data?.securityDashboard?.sessions ?? [],
    auditLog: data?.securityDashboard?.auditLog ?? [],
    twoFactorStats: data?.securityDashboard?.twoFactorStats ?? null,
    twoFactorUsers: data?.securityDashboard?.twoFactorUsers ?? [],
    loading,
    refetch,
  };
};

export const useExportAuditLog = () => {
  const [exportAuditLog, { loading }] = useMutation(EXPORT_AUDIT_LOG);

  return {
    exportAuditLog: (dateFrom?: string, dateTo?: string) =>
      exportAuditLog({ variables: { dateFrom, dateTo } }),
    loading,
  };
};

export const useRevokeSession = () => {
  const [revokeSession, { loading }] = useMutation(REVOKE_SESSION);

  return {
    revokeSession: (sessionId: string) =>
      revokeSession({ variables: { sessionId } }),
    loading,
  };
};
