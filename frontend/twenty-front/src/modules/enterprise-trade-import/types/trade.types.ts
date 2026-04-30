export type POStatus = 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type PurchaseOrderData = {
  id: string;
  poNumber: string;
  supplier: string;
  status: POStatus;
  totalAmount: number;
  currency: string;
  orderDate: string;
  expectedDelivery: string;
  itemCount: number;
};

export type ShipmentData = {
  id: string;
  trackingNumber: string;
  poNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  status: 'in_transit' | 'customs' | 'delivered' | 'delayed';
  departureDate: string;
  eta: string;
};

export type LandedCostItem = {
  id: string;
  description: string;
  category: 'product' | 'freight' | 'insurance' | 'customs_duty' | 'tax' | 'handling';
  amount: number;
  currency: string;
  percentage: number;
};
