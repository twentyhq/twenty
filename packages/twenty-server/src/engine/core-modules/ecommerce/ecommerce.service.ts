import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import {
  ECommerceProductEntity, ECommerceOrderEntity, AbandonedCartEntity,
  ECommerceSubscriptionEntity, LoyaltyMemberEntity, BrowseEventEntity,
  OrderStatus, CartStatus, SubscriptionStatus, LoyaltyTier, MarketplaceSource,
} from './ecommerce.entity';

@Injectable()
export class ECommerceService {
  constructor(
    @InjectRepository(ECommerceProductEntity) private readonly productRepo: Repository<ECommerceProductEntity>,
    @InjectRepository(ECommerceOrderEntity) private readonly orderRepo: Repository<ECommerceOrderEntity>,
    @InjectRepository(AbandonedCartEntity) private readonly cartRepo: Repository<AbandonedCartEntity>,
    @InjectRepository(ECommerceSubscriptionEntity) private readonly subRepo: Repository<ECommerceSubscriptionEntity>,
    @InjectRepository(LoyaltyMemberEntity) private readonly loyaltyRepo: Repository<LoyaltyMemberEntity>,
    @InjectRepository(BrowseEventEntity) private readonly browseRepo: Repository<BrowseEventEntity>,
  ) {}

  // ==================== CATALOG ====================
  async createProduct(workspaceId: string, data: Partial<ECommerceProductEntity>): Promise<ECommerceProductEntity> {
    return this.productRepo.save(this.productRepo.create({ workspaceId, ...data }));
  }

  async getDynamicPrice(productId: string, segment?: string, quantity?: number): Promise<number> {
    const p = await this.productRepo.findOne({ where: { id: productId } });
    if (!p) throw new NotFoundException(`Product ${productId} not found`);
    let price = Number(p.basePrice);
    if (segment && p.segmentPrices?.[segment]) price = p.segmentPrices[segment];
    if (quantity && p.volumeDiscounts) {
      const applicable = p.volumeDiscounts.filter((d) => quantity >= d.minQty).sort((a, b) => b.minQty - a.minQty);
      if (applicable.length) price *= (1 - applicable[0].discount / 100);
    }
    return Math.round(price * 100) / 100;
  }

  async getCrossSellRecommendations(productId: string): Promise<ECommerceProductEntity[]> {
    const p = await this.productRepo.findOne({ where: { id: productId } });
    if (!p?.crossSellIds?.length) return [];
    return this.productRepo.find({ where: p.crossSellIds.map((id) => ({ id })) });
  }

  // ==================== ORDERS ====================
  async createOrder(workspaceId: string, data: Partial<ECommerceOrderEntity>): Promise<ECommerceOrderEntity> {
    const count = await this.orderRepo.count({ where: { workspaceId } });
    const orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
    const items = data.items ?? [];
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const order = await this.orderRepo.save(this.orderRepo.create({
      workspaceId, orderNumber, subtotal,
      totalAmount: subtotal + Number(data.taxAmount ?? 0) + Number(data.shippingCost ?? 0) - Number(data.discountAmount ?? 0),
      ...data,
    }));

    // Update product stats
    for (const item of items) {
      await this.productRepo.increment({ id: item.productId }, 'totalSold', item.quantity);
    }

    // Award loyalty points (1 point per 1000 COP)
    if (data.contactId) {
      const points = Math.floor(Number(order.totalAmount) / 1000);
      order.loyaltyPointsEarned = points;
      await this.orderRepo.save(order);
      await this.addLoyaltyPoints(workspaceId, data.contactId, points, Number(order.totalAmount));
    }

    // Convert abandoned cart if exists
    if (data.contactId) {
      await this.cartRepo.update(
        { workspaceId, contactId: data.contactId, status: CartStatus.ACTIVE },
        { status: CartStatus.CONVERTED },
      );
    }

    return order;
  }

  async processReturn(orderId: string, returnItems: Array<{ productId: string; quantity: number; reason: string }>): Promise<ECommerceOrderEntity> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    order.status = OrderStatus.RETURNED;
    return this.orderRepo.save(order);
  }

  async createSubscription(workspaceId: string, data: Partial<ECommerceSubscriptionEntity>): Promise<ECommerceSubscriptionEntity> {
    return this.subRepo.save(this.subRepo.create({ workspaceId, startDate: new Date(), ...data }));
  }

  async processSubscriptionRenewal(workspaceId: string): Promise<number> {
    const due = await this.subRepo.find({ where: { workspaceId, status: SubscriptionStatus.ACTIVE, nextBillingDate: LessThan(new Date()) } });
    for (const sub of due) {
      sub.totalCharges++;
      sub.totalRevenue = Number(sub.totalRevenue) + Number(sub.amount);
      const nextDate = new Date(sub.nextBillingDate);
      if (sub.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
      else if (sub.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
      else nextDate.setFullYear(nextDate.getFullYear() + 1);
      sub.nextBillingDate = nextDate;
      await this.subRepo.save(sub);
    }
    return due.length;
  }

  // ==================== ABANDONED CART RECOVERY ====================
  async trackAbandonedCart(workspaceId: string, data: Partial<AbandonedCartEntity>): Promise<AbandonedCartEntity> {
    const cart = await this.cartRepo.save(this.cartRepo.create({
      workspaceId, status: CartStatus.ABANDONED, abandonedAt: new Date(),
      recoveryLink: `/recover/${Date.now()}`, ...data,
    }));
    return cart;
  }

  async getAbandonedCarts(workspaceId: string): Promise<AbandonedCartEntity[]> {
    return this.cartRepo.find({ where: { workspaceId, status: CartStatus.ABANDONED }, order: { cartValue: 'DESC' } });
  }

  async attemptCartRecovery(cartId: string, channel: string, discountPercent?: number): Promise<AbandonedCartEntity> {
    const cart = await this.cartRepo.findOne({ where: { id: cartId } });
    if (!cart) throw new NotFoundException(`Cart ${cartId} not found`);
    cart.recoveryAttempts++;
    cart.lastRecoveryChannel = channel;
    if (discountPercent) cart.discountOffered = discountPercent;
    return this.cartRepo.save(cart);
  }

  async recoverCart(cartId: string): Promise<AbandonedCartEntity> {
    const cart = await this.cartRepo.findOne({ where: { id: cartId } });
    if (!cart) throw new NotFoundException(`Cart ${cartId} not found`);
    cart.status = CartStatus.RECOVERED;
    cart.recoveredAt = new Date();
    return this.cartRepo.save(cart);
  }

  // ==================== BROWSE BEHAVIOR & AI RECOMMENDATIONS ====================
  async trackBrowseEvent(workspaceId: string, data: Partial<BrowseEventEntity>): Promise<BrowseEventEntity> {
    return this.browseRepo.save(this.browseRepo.create({ workspaceId, ...data }));
  }

  async getAIRecommendations(workspaceId: string, contactId: string, limit = 5): Promise<ECommerceProductEntity[]> {
    // Get purchase history
    const orders = await this.orderRepo.find({ where: { workspaceId, contactId }, order: { createdAt: 'DESC' }, take: 10 });
    const purchasedIds = new Set<string>();
    for (const o of orders) { for (const i of o.items ?? []) purchasedIds.add(i.productId); }

    // Get browsed categories
    const browses = await this.browseRepo.find({ where: { workspaceId, contactId }, order: { createdAt: 'DESC' }, take: 50 });
    const categories = [...new Set(browses.map((b) => b.category).filter(Boolean))];

    // Recommend: cross-sells of purchased + top products in browsed categories
    const recommendations: ECommerceProductEntity[] = [];

    for (const pid of purchasedIds) {
      const crossSells = await this.getCrossSellRecommendations(pid);
      for (const cs of crossSells) { if (!purchasedIds.has(cs.id) && !recommendations.find((r) => r.id === cs.id)) recommendations.push(cs); }
    }

    if (recommendations.length < limit && categories.length) {
      const categoryProducts = await this.productRepo.find({
        where: categories.map((c) => ({ workspaceId, category: c, isActive: true })),
        order: { totalSold: 'DESC' }, take: limit,
      });
      for (const p of categoryProducts) {
        if (!purchasedIds.has(p.id) && !recommendations.find((r) => r.id === p.id)) recommendations.push(p);
      }
    }

    return recommendations.slice(0, limit);
  }

  async getBrowseAbandonments(workspaceId: string): Promise<Array<{ contactId: string; category: string; viewCount: number; lastViewed: Date }>> {
    const browses = await this.browseRepo.find({
      where: { workspaceId, eventType: 'product_view' },
      order: { createdAt: 'DESC' }, take: 200,
    });

    const grouped: Record<string, { category: string; viewCount: number; lastViewed: Date }> = {};
    for (const b of browses) {
      if (!b.contactId) continue;
      const key = `${b.contactId}_${b.category}`;
      if (!grouped[key]) grouped[key] = { category: b.category ?? '', viewCount: 0, lastViewed: b.createdAt };
      grouped[key].viewCount++;
    }

    // Filter: viewed 3+ times but no purchase
    return Object.entries(grouped)
      .filter(([, v]) => v.viewCount >= 3)
      .map(([key, v]) => ({ contactId: key.split('_')[0], ...v }));
  }

  // ==================== LOYALTY & CLV ====================
  async addLoyaltyPoints(workspaceId: string, contactId: string, points: number, orderValue: number): Promise<LoyaltyMemberEntity> {
    let member = await this.loyaltyRepo.findOne({ where: { workspaceId, contactId } });
    if (!member) member = this.loyaltyRepo.create({ workspaceId, contactId });
    member.totalPoints += points;
    member.availablePoints += points;
    member.totalOrders++;
    member.lifetimeValue = Number(member.lifetimeValue) + orderValue;
    member.avgOrderValue = Number(member.lifetimeValue) / member.totalOrders;
    member.daysSinceLastOrder = 0;

    // Auto tier upgrade
    if (Number(member.lifetimeValue) > 5_000_000) member.tier = LoyaltyTier.GOLD;
    else if (Number(member.lifetimeValue) > 1_000_000) member.tier = LoyaltyTier.SILVER;

    // Predict CLV (simple: avg * projected orders next 12 months)
    const monthlyRate = member.totalOrders / Math.max(1, (Date.now() - member.createdAt.getTime()) / (30 * 86_400_000));
    member.predictedCLV = Number(member.avgOrderValue) * monthlyRate * 12;
    member.repurchaseRate = member.totalOrders > 1 ? Math.min(100, member.totalOrders * 20) : 0;

    return this.loyaltyRepo.save(member);
  }

  async redeemPoints(workspaceId: string, contactId: string, points: number): Promise<LoyaltyMemberEntity> {
    const member = await this.loyaltyRepo.findOne({ where: { workspaceId, contactId } });
    if (!member || member.availablePoints < points) throw new NotFoundException('Insufficient points');
    member.availablePoints -= points;
    member.redeemedPoints += points;
    return this.loyaltyRepo.save(member);
  }

  async getCohortRetention(workspaceId: string): Promise<Array<{ cohort: string; month1: number; month2: number; month3: number; month4: number }>> {
    const orders = await this.orderRepo.find({ where: { workspaceId }, order: { createdAt: 'ASC' } });
    const cohorts: Record<string, Set<string>[]> = {};

    for (const o of orders) {
      if (!o.contactId) continue;
      const firstOrder = orders.find((ord) => ord.contactId === o.contactId);
      if (!firstOrder) continue;
      const cohortMonth = firstOrder.createdAt.toISOString().substring(0, 7);
      if (!cohorts[cohortMonth]) cohorts[cohortMonth] = [new Set(), new Set(), new Set(), new Set()];
      const monthDiff = Math.floor((o.createdAt.getTime() - firstOrder.createdAt.getTime()) / (30 * 86_400_000));
      if (monthDiff >= 0 && monthDiff < 4) cohorts[cohortMonth][monthDiff].add(o.contactId);
    }

    return Object.entries(cohorts).map(([cohort, months]) => {
      const base = months[0].size || 1;
      return {
        cohort, month1: Math.round((months[0].size / base) * 100),
        month2: Math.round((months[1].size / base) * 100),
        month3: Math.round((months[2].size / base) * 100),
        month4: Math.round((months[3].size / base) * 100),
      };
    });
  }

  // ==================== ANALYTICS ====================
  async getECommerceAnalytics(workspaceId: string): Promise<{
    totalOrders: number; totalRevenue: number; avgOrderValue: number;
    cartAbandonmentRate: number; recoveryRate: number;
    subscriptionMRR: number; loyaltyMembers: number;
    topProducts: Array<{ name: string; sold: number; revenue: number }>;
    bySource: Record<string, { orders: number; revenue: number }>;
  }> {
    const orders = await this.orderRepo.find({ where: { workspaceId } });
    const completed = orders.filter((o) => [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED].includes(o.status));
    const carts = await this.cartRepo.find({ where: { workspaceId } });
    const abandoned = carts.filter((c) => c.status === CartStatus.ABANDONED).length;
    const recovered = carts.filter((c) => c.status === CartStatus.RECOVERED).length;
    const subs = await this.subRepo.find({ where: { workspaceId, status: SubscriptionStatus.ACTIVE } });
    const loyaltyCount = await this.loyaltyRepo.count({ where: { workspaceId } });
    const products = await this.productRepo.find({ where: { workspaceId }, order: { totalSold: 'DESC' }, take: 10 });

    const bySource: Record<string, { orders: number; revenue: number }> = {};
    for (const o of completed) {
      if (!bySource[o.source]) bySource[o.source] = { orders: 0, revenue: 0 };
      bySource[o.source].orders++;
      bySource[o.source].revenue += Number(o.totalAmount);
    }

    return {
      totalOrders: completed.length,
      totalRevenue: completed.reduce((s, o) => s + Number(o.totalAmount), 0),
      avgOrderValue: completed.length ? completed.reduce((s, o) => s + Number(o.totalAmount), 0) / completed.length : 0,
      cartAbandonmentRate: carts.length ? Math.round((abandoned / carts.length) * 100) : 0,
      recoveryRate: abandoned ? Math.round((recovered / abandoned) * 100) : 0,
      subscriptionMRR: subs.reduce((s, sub) => s + Number(sub.amount), 0),
      loyaltyMembers: loyaltyCount,
      topProducts: products.map((p) => ({ name: p.name, sold: p.totalSold, revenue: p.totalSold * Number(p.basePrice) })),
      bySource,
    };
  }
}
