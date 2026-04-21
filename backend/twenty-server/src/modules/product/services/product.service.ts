import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { ProductVariantWorkspaceEntity } from 'src/modules/product/standard-objects/product-variant.workspace-entity';

export interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  category?: string;
  imageUrl?: string;
  type?: string;
  unit?: string;
  weight?: number;
  dimensions?: string;
  isInventoryEnabled?: boolean;
  stockQuantity?: number;
  reorderPoint?: number;
  leadTimeDays?: number;
  isTaxable?: boolean;
  taxCategory?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductSearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  searchTerm?: string;
}

export interface InventoryReservation {
  productId: string;
  quantity: number;
  dealId: string;
  status: 'pending' | 'confirmed' | 'released';
  reservedAt: Date;
  expiresAt: Date;
}

export interface LowStockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  recommendedOrder: number;
}

@Injectable()
export class ProductService {
  private inventoryReservations: Map<string, InventoryReservation[]> = new Map();

  async createProduct(workspaceId: string, input: ProductInput) {
    return {
      id: `prod_${Date.now()}`,
      ...input,
      isActive: input.isActive ?? true,
      isInventoryEnabled: input.isInventoryEnabled ?? false,
      stockQuantity: input.stockQuantity ?? 0,
      createdAt: new Date().toISOString(),
    };
  }

  async updateProduct(workspaceId: string, productId: string, input: Partial<ProductInput>) {
    return {
      id: productId,
      ...input,
      updatedAt: new Date().toISOString(),
    };
  }

  async getProduct(workspaceId: string, productId: string) {
    return {
      id: productId,
      name: 'Sample Product',
      price: 100,
      stockQuantity: 50,
      isInventoryEnabled: true,
    };
  }

  async searchProducts(workspaceId: string, filters: ProductSearchFilters) {
    const products = [
      { id: 'prod_1', name: 'Product A', price: 100, stockQuantity: 50, category: 'Electronics' },
      { id: 'prod_2', name: 'Product B', price: 200, stockQuantity: 30, category: 'Software' },
      { id: 'prod_3', name: 'Product C', price: 150, stockQuantity: 0, category: 'Electronics' },
    ];

    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => (p.price ?? 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => (p.price ?? 0) <= filters.maxPrice!);
    }
    if (filters.inStock) {
      filtered = filtered.filter(p => (p.stockQuantity ?? 0) > 0);
    }
    if (filters.searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      );
    }

    return filtered;
  }

  async createVariant(workspaceId: string, input: ProductVariantInput) {
    return {
      id: `var_${Date.now()}`,
      productId: input.productId,
      name: input.name,
      sku: input.sku,
      price: input.price,
      cost: input.cost,
      stockQuantity: input.stockQuantity ?? 0,
      attributes: input.attributes ?? {},
      createdAt: new Date().toISOString(),
    };
  }

  async reserveStock(workspaceId: string, productId: string, quantity: number, dealId: string) {
    const reservation: InventoryReservation = {
      productId,
      quantity,
      dealId,
      status: 'pending',
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    const existing = this.inventoryReservations.get(productId) || [];
    existing.push(reservation);
    this.inventoryReservations.set(productId, existing);

    return {
      reservationId: `res_${Date.now()}`,
      productId,
      quantity,
      dealId,
      expiresAt: reservation.expiresAt,
    };
  }

  async confirmReservation(workspaceId: string, reservationId: string) {
    for (const [productId, reservations] of this.inventoryReservations.entries()) {
      const idx = reservations.findIndex(r => r.reservationId === reservationId || `res_${Date.now()}` === reservationId);
      if (idx >= 0) {
        reservations[idx].status = 'confirmed';
        return { success: true, reservationId };
      }
    }
    return { success: false, error: 'Reservation not found' };
  }

  async releaseReservation(workspaceId: string, reservationId: string) {
    for (const [productId, reservations] of this.inventoryReservations.entries()) {
      const idx = reservations.findIndex(r => r.reservationId === reservationId);
      if (idx >= 0) {
        reservations[idx].status = 'released';
        return { success: true };
      }
    }
    return { success: false };
  }

  async adjustStock(workspaceId: string, productId: string, adjustment: number, reason: string) {
    return {
      productId,
      previousStock: 100,
      newStock: 100 + adjustment,
      adjustment,
      reason,
      adjustedAt: new Date().toISOString(),
    };
  }

  async getLowStockAlerts(workspaceId: string): Promise<LowStockAlert[]> {
    const products = [
      { id: 'prod_1', name: 'Widget X', stockQuantity: 5, reorderPoint: 10 },
      { id: 'prod_2', name: 'Gadget Y', stockQuantity: 2, reorderPoint: 5 },
      { id: 'prod_3', name: 'Tool Z', stockQuantity: 15, reorderPoint: 10 },
    ];

    return products
      .filter(p => (p.stockQuantity ?? 0) <= p.reorderPoint)
      .map(p => ({
        productId: p.id,
        productName: p.name,
        currentStock: p.stockQuantity ?? 0,
        reorderPoint: p.reorderPoint,
        recommendedOrder: (p.reorderPoint * 2) - (p.stockQuantity ?? 0),
      }));
  }

  async calculateLandedCost(
    workspaceId: string,
    productId: string,
    params: {
      unitCost: number;
      quantity: number;
      freightCost: number;
      insuranceCost: number;
      customsDuty: number;
      brokerageFees: number;
    }
  ) {
    const { unitCost, quantity, freightCost, insuranceCost, customsDuty, brokerageFees } = params;
    const totalCost = (unitCost * quantity) + freightCost + insuranceCost + customsDuty + brokerageFees;
    const unitLandedCost = totalCost / quantity;

    return {
      productId,
      unitCost,
      quantity,
      freightCost,
      insuranceCost,
      customsDuty,
      brokerageFees,
      totalLandedCost: totalCost,
      unitLandedCost,
      currency: 'USD',
    };
  }

  async getInventoryValuation(workspaceId: string) {
    const products = [
      { id: 'prod_1', name: 'Product A', stockQuantity: 100, cost: 50 },
      { id: 'prod_2', name: 'Product B', stockQuantity: 50, cost: 100 },
      { id: 'prod_3', name: 'Product C', stockQuantity: 200, cost: 25 },
    ];

    const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.cost), 0);
    const totalItems = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const averageValue = totalItems > 0 ? totalValue / totalItems : 0;

    return {
      products: products.map(p => ({
        productId: p.id,
        productName: p.name,
        quantity: p.stockQuantity,
        unitCost: p.cost,
        totalValue: p.stockQuantity * p.cost,
      })),
      summary: {
        totalProducts: products.length,
        totalItems,
        totalValue,
        averageUnitValue: averageValue,
      },
      valuationDate: new Date().toISOString(),
    };
  }
}
