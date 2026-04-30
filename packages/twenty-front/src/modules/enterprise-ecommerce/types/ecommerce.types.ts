export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type OrderSource = 'website' | 'mobile_app' | 'marketplace' | 'social' | 'pos';

export type OrderData = {
  id: string;
  customerName: string;
  status: OrderStatus;
  source: OrderSource;
  amount: number;
  currency: string;
  itemCount: number;
  createdAt: string;
};

export type AbandonedCartData = {
  id: string;
  customerEmail: string;
  itemCount: number;
  cartValue: number;
  currency: string;
  abandonedAt: string;
  recoveryEmailSent: boolean;
  recovered: boolean;
};

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type LoyaltyMember = {
  id: string;
  name: string;
  tier: LoyaltyTier;
  points: number;
  lifetimeSpend: number;
  currency: string;
  joinedAt: string;
};

export type LoyaltyStats = {
  totalMembers: number;
  activeMembers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  redemptionRate: number;
};
