import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum OrderStatus { PENDING = 'pending', CONFIRMED = 'confirmed', PROCESSING = 'processing', SHIPPED = 'shipped', DELIVERED = 'delivered', CANCELLED = 'cancelled', RETURNED = 'returned' }
export enum CartStatus { ACTIVE = 'active', ABANDONED = 'abandoned', RECOVERED = 'recovered', CONVERTED = 'converted' }
export enum SubscriptionStatus { ACTIVE = 'active', PAUSED = 'paused', CANCELLED = 'cancelled', EXPIRED = 'expired' }
export enum LoyaltyTier { BRONZE = 'bronze', SILVER = 'silver', GOLD = 'gold' }
export enum MarketplaceSource { SHOPIFY = 'shopify', WOOCOMMERCE = 'woocommerce', MERCADOLIBRE = 'mercadolibre', AMAZON = 'amazon', DIRECT = 'direct' }

@Entity('ecommerce_product')
@Index(['workspaceId', 'sku'])
export class ECommerceProductEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) sku: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'decimal', precision: 14, scale: 2 }) basePrice: number;
  @Column({ type: 'simple-json', nullable: true }) segmentPrices: Record<string, number>;
  @Column({ type: 'simple-json', nullable: true }) volumeDiscounts: Array<{ minQty: number; discount: number }>;
  @Column({ type: 'simple-json', nullable: true }) images: string[];
  @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
  @Column({ type: 'simple-json', nullable: true }) variants: Array<{ name: string; options: string[] }>;
  @Column({ type: 'simple-json', nullable: true }) crossSellIds: string[];
  @Column({ type: 'simple-json', nullable: true }) bundleIds: string[];
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'boolean', default: false }) syncedToShopify: boolean;
  @Column({ type: 'boolean', default: false }) syncedToMercadoLibre: boolean;
  @Column({ type: 'int', default: 0 }) totalSold: number;
  @Column({ type: 'float', default: 0 }) avgRating: number;
  @Column({ type: 'int', default: 0 }) reviewCount: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('ecommerce_order')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'contactId'])
@Index(['workspaceId', 'source'])
export class ECommerceOrderEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'varchar', length: 50, nullable: false }) orderNumber: string;
  @Column({ nullable: true }) contactId: string;
  @Column({ nullable: true }) accountId: string;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING }) status: OrderStatus;
  @Column({ type: 'enum', enum: MarketplaceSource, default: MarketplaceSource.DIRECT }) source: MarketplaceSource;
  @Column({ type: 'varchar', length: 255, nullable: true }) externalOrderId: string;
  @Column({ type: 'simple-json', nullable: true }) items: Array<{ productId: string; name: string; sku: string; quantity: number; unitPrice: number; discount: number; total: number }>;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) subtotal: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) taxAmount: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) shippingCost: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) discountAmount: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) totalAmount: number;
  @Column({ type: 'varchar', length: 3, default: 'COP' }) currency: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) paymentMethod: string;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) paymentStatus: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) shippingAddress: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) billingAddress: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) trackingNumber: string;
  @Column({ type: 'text', nullable: true }) customerNotes: string;
  @Column({ type: 'int', default: 0 }) loyaltyPointsEarned: number;
  @Column({ type: 'int', default: 0 }) loyaltyPointsRedeemed: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('abandoned_cart')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'contactId'])
export class AbandonedCartEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: true }) contactId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string;
  @Column({ type: 'enum', enum: CartStatus, default: CartStatus.ACTIVE }) status: CartStatus;
  @Column({ type: 'simple-json', nullable: true }) items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) cartValue: number;
  @Column({ type: 'varchar', length: 500, nullable: true }) recoveryLink: string;
  @Column({ type: 'int', default: 0 }) recoveryAttempts: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) lastRecoveryChannel: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) discountOffered: number;
  @Column({ type: 'timestamp', nullable: true }) abandonedAt: Date;
  @Column({ type: 'timestamp', nullable: true }) recoveredAt: Date;
  @CreateDateColumn() createdAt: Date;
}

@Entity('ecommerce_subscription')
@Index(['workspaceId', 'contactId'])
export class ECommerceSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) contactId: string;
  @Column({ nullable: false }) productId: string;
  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE }) status: SubscriptionStatus;
  @Column({ type: 'varchar', length: 20, default: 'monthly' }) frequency: string;
  @Column({ type: 'decimal', precision: 14, scale: 2 }) amount: number;
  @Column({ type: 'date', nullable: true }) nextBillingDate: Date;
  @Column({ type: 'date', nullable: true }) startDate: Date;
  @Column({ type: 'date', nullable: true }) cancelledAt: Date;
  @Column({ type: 'int', default: 0 }) totalCharges: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) totalRevenue: number;
  @CreateDateColumn() createdAt: Date;
}

@Entity('loyalty_member')
@Index(['workspaceId', 'contactId'])
export class LoyaltyMemberEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) contactId: string;
  @Column({ type: 'enum', enum: LoyaltyTier, default: LoyaltyTier.BRONZE }) tier: LoyaltyTier;
  @Column({ type: 'int', default: 0 }) totalPoints: number;
  @Column({ type: 'int', default: 0 }) availablePoints: number;
  @Column({ type: 'int', default: 0 }) redeemedPoints: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) lifetimeValue: number;
  @Column({ type: 'int', default: 0 }) totalOrders: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) avgOrderValue: number;
  @Column({ type: 'int', default: 0 }) daysSinceLastOrder: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) predictedCLV: number;
  @Column({ type: 'varchar', length: 100, nullable: true }) preferredCategory: string;
  @Column({ type: 'float', default: 0 }) repurchaseRate: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('browse_event')
@Index(['workspaceId', 'contactId', 'createdAt'])
export class BrowseEventEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: true }) contactId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) sessionId: string;
  @Column({ type: 'varchar', length: 50 }) eventType: string;
  @Column({ nullable: true }) productId: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) pageUrl: string;
  @Column({ type: 'int', default: 0 }) durationSeconds: number;
  @CreateDateColumn() createdAt: Date;
}
