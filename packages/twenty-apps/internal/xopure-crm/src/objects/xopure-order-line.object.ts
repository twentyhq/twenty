import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_ORDER_LINE_OBJECT_ID = 'ccf1dee4-b3fa-4f66-b050-f64dec28f185';
export const XOPURE_ORDER_LINE_NAME_FIELD_ID = '21fbe270-9899-4fb1-9a9d-a367b443b69b';
export const XOPURE_ORDER_LINE_SKU_FIELD_ID = 'f92d2ad8-e95f-4b07-9ae1-536a94336aef';

export default defineObject({
  universalIdentifier: XOPURE_ORDER_LINE_OBJECT_ID,
  nameSingular: 'xopureOrderLine',
  namePlural: 'xopureOrderLines',
  labelSingular: 'XO Pure Order Line',
  labelPlural: 'XO Pure Order Lines',
  description: 'Synced item-level order details from public.order_items.',
  icon: 'IconListDetails',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_ORDER_LINE_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: XOPURE_ORDER_LINE_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconListDetails' },
    { universalIdentifier: '8d45f9e3-587a-4b20-a915-6e2cd8f271d5', type: FieldType.TEXT, name: 'supabaseOrderItemId', label: 'Supabase order item ID', icon: 'IconDatabase' },
    { universalIdentifier: 'a4a0e3c0-5dae-4270-8235-5e91c4941595', type: FieldType.TEXT, name: 'supabaseOrderId', label: 'Supabase order ID', icon: 'IconShoppingBag' },
    { universalIdentifier: '87f42103-4238-4f5f-beb6-f23db49f3d1f', type: FieldType.TEXT, name: 'supabaseProductId', label: 'Supabase product ID', icon: 'IconBottle' },
    { universalIdentifier: XOPURE_ORDER_LINE_SKU_FIELD_ID, type: FieldType.TEXT, name: 'sku', label: 'SKU', icon: 'IconBarcode' },
    { universalIdentifier: '6bd334fe-5245-4543-b5ce-60f905eafe70', type: FieldType.NUMBER, name: 'quantity', label: 'Quantity', icon: 'IconHash', defaultValue: 1 },
    { universalIdentifier: '11350a12-46b3-499d-b05f-6a4d8a6c5f2b', type: FieldType.NUMBER, name: 'unitPriceCents', label: 'Unit price cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: '0eb296b0-8040-4b30-ba63-41f0db8affaa', type: FieldType.NUMBER, name: 'lineTotalCents', label: 'Line total cents', icon: 'IconReceipt', defaultValue: 0 },
    { universalIdentifier: 'f1415667-015d-4a73-b092-381cc759c350', type: FieldType.NUMBER, name: 'cvAmount', label: 'CV amount', icon: 'IconChartBar', defaultValue: 0 },
    { universalIdentifier: '385f8484-d851-4c65-80de-980b3f5507bd', type: FieldType.TEXT, name: 'category', label: 'Category', icon: 'IconCategory' },
  ],
});
