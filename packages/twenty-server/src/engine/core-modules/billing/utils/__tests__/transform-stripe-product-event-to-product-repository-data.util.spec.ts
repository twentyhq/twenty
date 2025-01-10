import Stripe from 'stripe';

import { transformStripeProductEventToProductRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-product-event-to-product-repository-data.util';

describe('transformStripeProductEventToProductRepositoryData', () => {
  it('should return the correct data', () => {
    const data: Stripe.ProductCreatedEvent.Data = {
      object: {
        id: 'prod_123',
        name: 'Product 1',
        active: true,
        description: 'Description 1',
        images: ['image1.jpg', 'image2.jpg'],
        marketing_features: [
          {
            name: 'feature1',
          },
        ],
        created: 1719859200,
        updated: 1719859200,
        type: 'service',
        livemode: false,
        package_dimensions: null,
        shippable: false,
        object: 'product',
        default_price: 'price_123',
        unit_label: 'Unit',
        url: 'https://example.com',
        tax_code: 'tax_code_1',
        metadata: { key: 'value' },
      },
    };

    const result = transformStripeProductEventToProductRepositoryData(data);

    expect(result).toEqual({
      stripeProductId: 'prod_123',
      name: 'Product 1',
      active: true,
      description: 'Description 1',
      images: ['image1.jpg', 'image2.jpg'],
      marketingFeatures: [{ name: 'feature1' }],
      defaultStripePriceId: 'price_123',
      unitLabel: 'Unit',
      url: 'https://example.com',
      taxCode: 'tax_code_1',
    });
  });

  it('should return the correct data with null values', () => {
    const data: Stripe.ProductUpdatedEvent.Data = {
      object: {
        id: 'prod_456',
        name: 'Product 2',
        object: 'product',
        active: false,
        description: '',
        images: [],
        created: 1719859200,
        updated: 1719859200,
        type: 'service',
        livemode: false,
        package_dimensions: null,
        shippable: false,
        marketing_features: [],
        default_price: null,
        unit_label: null,
        url: null,
        tax_code: null,
        metadata: {},
      },
    };

    const result = transformStripeProductEventToProductRepositoryData(data);

    expect(result).toEqual({
      stripeProductId: 'prod_456',
      name: 'Product 2',
      active: false,
      description: '',
      images: [],
      marketingFeatures: [],
      defaultStripePriceId: undefined,
      unitLabel: undefined,
      url: undefined,
      taxCode: undefined,
    });
  });
});
