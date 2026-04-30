import { gql } from '@apollo/client';

export const GET_ORG_CHART = gql`
  query GetOrgChart($departmentFilter: String) {
    orgChart(departmentFilter: $departmentFilter) {
      id
      name
      title
      department
      children {
        id
        name
        title
        department
        children {
          id
          name
          title
          department
          children {
            id
            name
            title
            department
          }
        }
      }
    }
  }
`;

export const GET_WORKFORCE_ANALYTICS = gql`
  query GetWorkforceAnalytics($dateRange: DateRangeInput) {
    workforceAnalytics(dateRange: $dateRange) {
      totalEmployees
      activeCount
      onLeaveCount
      terminatedCount
      turnoverRate
      avgTenureDays
      byDepartment {
        department
        headcount
        openPositions
      }
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id
      name
      email
      department
      title
      managerId
      status
      hireDate
    }
  }
`;

export const CALCULATE_PAYROLL = gql`
  mutation CalculatePayroll($periodId: ID!) {
    calculatePayroll(periodId: $periodId) {
      periodId
      totalGross
      totalDeductions
      totalNet
      employeeCount
      currency
    }
  }
`;

export const GET_ENPS = gql`
  query GetENPS($periodId: ID) {
    enps(periodId: $periodId) {
      score
      promoters
      passives
      detractors
      totalResponses
      responseRate
      trend {
        period
        score
      }
    }
  }
`;
