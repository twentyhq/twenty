import { gql } from '@apollo/client';

export const ADD_STOCK = gql`
  mutation AddStock($input: AddStockInput!) {
    addStock(input: $input) {
      id
      productId
      warehouseId
      quantity
      updatedAt
    }
  }
`;

export const GET_LOW_STOCK_ALERTS = gql`
  query GetLowStockAlerts($warehouseId: ID, $threshold: Float) {
    lowStockAlerts(warehouseId: $warehouseId, threshold: $threshold) {
      id
      productId
      productName
      sku
      currentStock
      minimumStock
      reorderPoint
      warehouseName
      daysUntilStockout
      severity
    }
  }
`;

export const GET_STOCK_VALUATION = gql`
  query GetStockValuation($warehouseId: ID, $valuationMethod: ValuationMethod) {
    stockValuation(
      warehouseId: $warehouseId
      valuationMethod: $valuationMethod
    ) {
      totalValue
      currency
      itemCount
      byCategory {
        category
        value
        quantity
      }
      byWarehouse {
        warehouseId
        warehouseName
        value
        quantity
      }
    }
  }
`;

export const GET_INVENTORY_ITEMS = gql`
  query GetInventoryItems(
    $warehouseId: ID
    $categoryId: ID
    $search: String
    $limit: Int
    $offset: Int
  ) {
    inventoryItems(
      warehouseId: $warehouseId
      categoryId: $categoryId
      search: $search
      limit: $limit
      offset: $offset
    ) {
      edges {
        node {
          id
          productName
          sku
          currentStock
          reservedStock
          availableStock
          unitCost
          totalValue
          warehouseName
          lastMovementAt
        }
      }
      totalCount
    }
  }
`;
