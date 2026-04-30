import { gql } from '@apollo/client';

export const GET_ACTIVE_PROJECTS = gql`
  query GetActiveProjects(
    $status: ProjectStatus
    $ownerId: ID
    $limit: Int
    $offset: Int
  ) {
    activeProjects(
      status: $status
      ownerId: $ownerId
      limit: $limit
      offset: $offset
    ) {
      edges {
        node {
          id
          name
          description
          status
          health
          owner
          startDate
          endDate
          progressPercent
          budget
          spent
          currency
        }
      }
      totalCount
    }
  }
`;

export const CREATE_PROJECT_FROM_DEAL = gql`
  mutation CreateProjectFromDeal($dealId: ID!, $input: CreateProjectInput!) {
    createProjectFromDeal(dealId: $dealId, input: $input) {
      id
      name
      description
      status
      health
      owner
      startDate
      endDate
      budget
      currency
    }
  }
`;

export const GET_GANTT_DATA = gql`
  query GetGanttData($projectId: ID!) {
    ganttData(projectId: $projectId) {
      tasks {
        id
        name
        startDate
        endDate
        progressPercent
        assignee
      }
      dependencies {
        fromTaskId
        toTaskId
        type
      }
    }
  }
`;

export const LOG_TIME = gql`
  mutation LogTime($input: LogTimeInput!) {
    logTime(input: $input) {
      id
      projectId
      projectName
      taskDescription
      hours
      date
      user
    }
  }
`;

export const GET_PL_BY_PROJECT = gql`
  query GetPLByProject($projectId: ID!) {
    profitAndLossByProject(projectId: $projectId) {
      projectId
      projectName
      totalRevenue
      totalCost
      laborCost
      materialCost
      overheadCost
      grossMargin
      marginPercent
      currency
    }
  }
`;
