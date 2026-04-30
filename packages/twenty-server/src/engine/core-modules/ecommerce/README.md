# E-Commerce

Product catalog with dynamic pricing, order management, abandoned cart recovery, subscriptions, loyalty program, marketplace sync (Shopify/MercadoLibre), AI recommendations, and cohort retention.

## Entities
- `ECommerceProductEntity` — name, sku, basePrice, segmentPrices, volumeDiscounts, crossSellIds, bundleIds, syncedToShopify, syncedToMercadoLibre, avgRating
- `ECommerceOrderEntity` — orderNumber, contactId, status, source (shopify/woocommerce/mercadolibre/amazon/direct), items, totalAmount, loyaltyPointsEarned
- `AbandonedCartEntity` — contactId, items, cartValue, recoveryLink, recoveryAttempts, discountOffered
- `ECommerceSubscriptionEntity` — contactId, productId, frequency, amount, nextBillingDate, totalRevenue
- `LoyaltyMemberEntity` — contactId, tier (bronze/silver/gold), totalPoints, lifetimeValue, predictedCLV, repurchaseRate
- `ProductReviewEntity` — productId, rating, comment, verified
- `BrowseEventEntity` — contactId, eventType, productId, pageUrl, durationSeconds

## Service Methods
- `getDynamicPrice(productId, segment, quantity)` — segment + volume pricing
- `createOrder(workspaceId, data)` — creates order, awards loyalty points, converts carts
- `trackAbandonedCart(workspaceId, data)` — tracks abandoned cart
- `attemptCartRecovery(cartId, channel, discount)` — recovery with optional discount
- `getAIRecommendations(workspaceId, contactId)` — cross-sell + browsing-based recommendations
- `addLoyaltyPoints(workspaceId, contactId, points, orderValue)` — auto tier upgrade
- `syncProductToShopify(workspaceId, productId, config)` — syncs to Shopify API
- `syncProductToMercadoLibre(workspaceId, productId, config)` — syncs to ML API
- `processWebhookShopify(workspaceId, event, payload)` — processes Shopify order webhooks
- `processWebhookMercadoLibre(workspaceId, topic, payload)` — processes ML webhooks
- `getCohortRetention(workspaceId)` — monthly cohort retention analysis
- `getECommerceAnalytics(workspaceId)` — orders, revenue, cart abandonment, MRR, by source

## REST Endpoints
- E-commerce controller for marketplace webhooks

## Feature Flag
`IS_MODULE_ECOMMERCE_ENABLED`

## Dependencies
- None
