export type StockLevel = 'in_stock' | 'low_stock' | 'out_of_stock';

export type WarehouseData = {
  id: string;
  name: string;
  location: string;
  skuCount: number;
  totalUnits: number;
  utilizationPercent: number;
};

export type StockItem = {
  id: string;
  sku: string;
  name: string;
  warehouseId: string;
  quantity: number;
  reorderPoint: number;
  level: StockLevel;
  unitCost: number;
};

export type StockMovement = {
  id: string;
  sku: string;
  itemName: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment';
  quantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  performedBy: string;
  timestamp: string;
  reference: string;
};
