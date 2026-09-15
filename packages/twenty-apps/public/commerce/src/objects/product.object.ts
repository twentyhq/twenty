import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  PRODUCT_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_DURATION_MINUTES_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_IMAGES_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  PRODUCT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_SKU_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_STOCK_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
  PRODUCT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  SERVICE_PACKAGE = 'SERVICE_PACKAGE',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export default defineObject({
  universalIdentifier: PRODUCT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'product',
  namePlural: 'products',
  labelSingular: 'Product',
  labelPlural: 'Products',
  description: 'Products, services, and packages offered to customers',
  icon: 'IconPackage',
  labelIdentifierFieldMetadataUniversalIdentifier:
    PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: PRODUCT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Product Name',
      description: 'The display name of the product or service',
      icon: 'IconTag',
    },
    {
      universalIdentifier: PRODUCT_SKU_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'sku',
      label: 'SKU',
      description: 'Stock Keeping Unit or unique item code',
      icon: 'IconBarcode',
      isNullable: true,
    },
    {
      universalIdentifier: PRODUCT_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'productType',
      label: 'Type',
      icon: 'IconCategory',
      defaultValue: `'${ProductType.PRODUCT}'`,
      options: [
        {
          id: 'a1111111-1111-4111-8111-111111111111',
          value: ProductType.PRODUCT,
          label: 'Product',
          position: 0,
          color: 'blue',
        },
        {
          id: 'b2222222-2222-4222-8222-222222222222',
          value: ProductType.SERVICE,
          label: 'Service',
          position: 1,
          color: 'orange',
        },
        {
          id: 'c3333333-3333-4333-8333-333333333333',
          value: ProductType.SERVICE_PACKAGE,
          label: 'Service Package',
          position: 2,
          color: 'purple',
        },
      ],
    },
    {
      universalIdentifier: PRODUCT_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.CURRENCY,
      name: 'price',
      label: 'Price',
      icon: 'IconCoin',
      isNullable: true,
    },
    {
      universalIdentifier: PRODUCT_DURATION_MINUTES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'durationMinutes',
      label: 'Duration (Minutes)',
      description:
        'Service duration in minutes for appointment planning (Spa, Clinic, Consulting)',
      icon: 'IconClock',
      isNullable: true,
    },
    {
      universalIdentifier: PRODUCT_STOCK_QUANTITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'stockQuantity',
      label: 'Stock Quantity',
      description: 'Current quantity in stock for physical products',
      icon: 'IconBox',
      isNullable: true,
      defaultValue: 0,
    },
    {
      universalIdentifier: PRODUCT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${ProductStatus.ACTIVE}'`,
      options: [
        {
          id: 'd4444444-4444-4444-8444-444444444444',
          value: ProductStatus.ACTIVE,
          label: 'Active',
          position: 0,
          color: 'green',
        },
        {
          id: 'e5555555-5555-4555-8555-555555555555',
          value: ProductStatus.INACTIVE,
          label: 'Inactive',
          position: 1,
          color: 'gray',
        },
        {
          id: 'f6666666-6666-4666-8666-666666666666',
          value: ProductStatus.ARCHIVED,
          label: 'Archived',
          position: 2,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: PRODUCT_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RICH_TEXT,
      name: 'description',
      label: 'Description',
      description: 'Detailed description of the product or service',
      icon: 'IconNotes',
      isNullable: true,
    },
    {
      universalIdentifier: PRODUCT_IMAGES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FILES,
      name: 'images',
      label: 'Images',
      description: 'Product photos or service illustration images',
      icon: 'IconPhoto',
      isNullable: true,
      universalSettings: { maxNumberOfValues: 30 },
    },
  ],
});
