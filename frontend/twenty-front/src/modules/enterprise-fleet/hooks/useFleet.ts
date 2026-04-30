import { gql } from '@apollo/client';

export const GET_FLEET_ANALYTICS = gql`
  query GetFleetAnalytics($dateRange: DateRangeInput) {
    fleetAnalytics(dateRange: $dateRange) {
      totalVehicles
      availableCount
      inTransitCount
      maintenanceCount
      totalDeliveries
      onTimeRate
      avgDeliveryTime
      fuelCostTotal
      costPerKm
      currency
    }
  }
`;

export const CREATE_DELIVERY = gql`
  mutation CreateDelivery($input: CreateDeliveryInput!) {
    createDelivery(input: $input) {
      id
      orderId
      vehicleId
      driver
      origin
      destination
      status
      estimatedArrival
    }
  }
`;

export const AUTO_DISPATCH = gql`
  mutation AutoDispatchFleet($deliveryIds: [ID!]!) {
    autoDispatchFleet(deliveryIds: $deliveryIds) {
      assignments {
        deliveryId
        vehicleId
        driver
        estimatedArrival
      }
      unassignedCount
    }
  }
`;

export const RECORD_FUEL = gql`
  mutation RecordFuel($input: RecordFuelInput!) {
    recordFuel(input: $input) {
      id
      vehicleId
      plate
      liters
      costPerLiter
      totalCost
      odometer
      date
      station
      hasAnomaly
      anomalyReason
    }
  }
`;

export const GET_DRIVER_PERFORMANCE = gql`
  query GetDriverPerformance($driverId: ID, $dateRange: DateRangeInput) {
    driverPerformance(driverId: $driverId, dateRange: $dateRange) {
      drivers {
        id
        name
        deliveriesCompleted
        onTimeRate
        avgDeliveryTime
        fuelEfficiency
        safetyScore
        customerRating
      }
    }
  }
`;
