import { gql } from '@apollo/client';

export const GET_ACTIVE_MODULES = gql`
  query GetActiveAIModules {
    activeAIModules {
      id
      moduleKey
      moduleName
      description
      status
      modelProvider
      modelName
      activatedAt
      monthlyTokenUsage
      monthlyTokenLimit
      monthlyCost
    }
  }
`;

export const GET_USAGE_DASHBOARD = gql`
  query GetAIUsageDashboard($dateRange: DateRangeInput) {
    aiUsageDashboard(dateRange: $dateRange) {
      totalRequests
      totalTokensUsed
      totalCost
      averageLatency
      errorRate
      byModule {
        moduleKey
        moduleName
        requests
        tokensUsed
        cost
        averageLatency
      }
      byDay {
        date
        requests
        tokensUsed
        cost
      }
      topPrompts {
        promptTemplate
        usageCount
        averageTokens
        averageLatency
      }
    }
  }
`;

export const TOGGLE_AI_MODULE = gql`
  mutation ToggleAIModule($moduleId: ID!, $enabled: Boolean!) {
    toggleAIModule(moduleId: $moduleId, enabled: $enabled) {
      id
      moduleKey
      status
      activatedAt
    }
  }
`;

export const GET_AI_AUDIT_LOG = gql`
  query GetAIAuditLog($moduleKey: String, $limit: Int, $offset: Int) {
    aiAuditLog(moduleKey: $moduleKey, limit: $limit, offset: $offset) {
      edges {
        node {
          id
          moduleKey
          action
          userId
          userName
          inputSummary
          outputSummary
          tokensUsed
          latencyMs
          status
          createdAt
        }
      }
      totalCount
    }
  }
`;
