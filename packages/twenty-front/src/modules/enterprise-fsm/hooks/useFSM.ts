import { gql } from '@apollo/client';

export const GET_FSM_ANALYTICS = gql`
  query GetFSMAnalytics($dateRange: DateRangeInput) {
    fsmAnalytics(dateRange: $dateRange) {
      totalWorkOrders
      completedCount
      openCount
      avgCompletionTime
      firstTimeFixRate
      customerSatisfaction
      technicianUtilization
      byPriority {
        priority
        count
      }
    }
  }
`;

export const CREATE_WORK_ORDER = gql`
  mutation CreateWorkOrder($input: CreateWorkOrderInput!) {
    createWorkOrder(input: $input) {
      id
      title
      description
      status
      priority
      technicianId
      technicianName
      customerName
      location
      scheduledDate
    }
  }
`;

export const AUTO_DISPATCH = gql`
  mutation AutoDispatchFSM($workOrderIds: [ID!]!) {
    autoDispatchFSM(workOrderIds: $workOrderIds) {
      assignments {
        workOrderId
        technicianId
        technicianName
        estimatedArrival
        travelDistance
      }
      unassignedCount
    }
  }
`;

export const COMPLETE_WORK = gql`
  mutation CompleteWork($workOrderId: ID!, $input: CompleteWorkInput!) {
    completeWork(workOrderId: $workOrderId, input: $input) {
      id
      workOrderId
      technicianName
      arrivalTime
      completionTime
      checklist {
        id
        label
        checked
      }
      notes
      photoCount
      customerSignature
    }
  }
`;

export const GET_AVAILABLE_TECHNICIANS = gql`
  query GetAvailableTechnicians(
    $specialty: String
    $location: String
    $date: String
  ) {
    availableTechnicians(
      specialty: $specialty
      location: $location
      date: $date
    ) {
      technicians {
        id
        name
        specialty
        status
        currentLocation
        activeWorkOrders
        completedToday
      }
    }
  }
`;
