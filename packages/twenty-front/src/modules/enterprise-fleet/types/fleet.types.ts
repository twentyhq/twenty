export type VehicleStatus = 'available' | 'in_transit' | 'maintenance' | 'offline';

export type VehicleData = {
  id: string;
  plate: string;
  model: string;
  driver: string;
  status: VehicleStatus;
  lastLocation: string;
  mileage: number;
};

export type DeliveryStatus = 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';

export type DeliveryData = {
  id: string;
  orderId: string;
  vehicleId: string;
  driver: string;
  origin: string;
  destination: string;
  status: DeliveryStatus;
  estimatedArrival: string;
  events: DeliveryEvent[];
};

export type DeliveryEvent = {
  timestamp: string;
  status: DeliveryStatus;
  location: string;
};

export type FuelEntry = {
  id: string;
  vehicleId: string;
  plate: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  odometer: number;
  date: string;
  station: string;
  hasAnomaly: boolean;
  anomalyReason?: string;
};
