import { gql } from '@apollo/client';

export const GET_TICKET_METRICS = gql`
  query GetTicketMetrics($dateRange: DateRangeInput) {
    ticketMetrics(dateRange: $dateRange) {
      totalOpen
      totalResolved
      averageResolutionTime
      satisfactionScore
      byPriority {
        priority
        count
      }
      byCategory {
        category
        count
      }
    }
  }
`;

export const CREATE_TICKET = gql`
  mutation CreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      id
      ticketNumber
      subject
      status
      priority
      assigneeId
      createdAt
    }
  }
`;

export const ASSIGN_TICKET = gql`
  mutation AssignTicket($ticketId: ID!, $assigneeId: ID!) {
    assignTicket(ticketId: $ticketId, assigneeId: $assigneeId) {
      id
      ticketNumber
      assigneeId
      assigneeName
      updatedAt
    }
  }
`;

export const GET_TICKETS = gql`
  query GetTickets(
    $status: TicketStatus
    $priority: TicketPriority
    $assigneeId: ID
    $limit: Int
    $offset: Int
  ) {
    tickets(
      status: $status
      priority: $priority
      assigneeId: $assigneeId
      limit: $limit
      offset: $offset
    ) {
      edges {
        node {
          id
          ticketNumber
          subject
          status
          priority
          category
          assigneeName
          customerName
          createdAt
          updatedAt
          firstResponseAt
          resolvedAt
        }
      }
      totalCount
    }
  }
`;
