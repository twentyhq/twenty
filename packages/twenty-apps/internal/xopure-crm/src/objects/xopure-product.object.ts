import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_PRODUCT_OBJECT_ID = 'a620ee62-3e19-48f3-932c-a39a6f23b068';
export const XOPURE_PRODUCT_NAME_FIELD_ID = 'fe73abc7-b74c-45a0-9446-57ea3f5f4dd9';
export const XOPURE_PRODUCT_SKU_FIELD_ID = '711b9fca-a26b-4dd2-8d34-6bc449739018';
export const XOPURE_PRODUCT_STATUS_FIELD_ID = 'ba8d4530-2c60-469a-98ef-5630dd4314a0';

export default defineObject({
  universalIdentifier: XOPURE_PRODUCT_OBJECT_ID,
  nameSingular: 'xopureProduct',
  namePlural: 'xopureProducts',
  labelSingular: 'XO Pure Product',
  labelPlural: 'XO Pure Products',
  description: 'Synced XO Pure product catalog data used for order and commission context.',
  icon: 'IconBottle',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_PRODUCT_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: XOPURE_PRODUCT_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconBottle' },
    { universalIdentifier: 'd18a8cdb-0c49-469e-8f9f-21014769d0ed', type: FieldType.TEXT, name: 'supabaseProductId', label: 'Supabase product ID', icon: 'IconDatabase', isUnique: true },
    { universalIdentifier: XOPURE_PRODUCT_SKU_FIELD_ID, type: FieldType.TEXT, name: 'sku', label: 'SKU', icon: 'IconBarcode' },
    { universalIdentifier: '01fd8a3d-88b9-43a0-b46b-4171654ad47b', type: FieldType.TEXT, name: 'slug', label: 'Slug', icon: 'IconLink' },
    { universalIdentifier: '30d632bf-a64e-48d1-a5c2-47139c00dce8', type: FieldType.NUMBER, name: 'priceCents', label: 'Price cents', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: '3a317cbd-48fd-453e-991c-7b4e7a105fe8', type: FieldType.TEXT, name: 'currency', label: 'Currency', icon: 'IconCash' },
    { universalIdentifier: '0fb15744-00ee-408b-aff0-9a26edc06dbd', type: FieldType.TEXT, name: 'category', label: 'Category', icon: 'IconCategory' },
    {
      universalIdentifier: XOPURE_PRODUCT_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconCircleCheck',
      defaultValue: "'ACTIVE'",
      options: [
        { id: '9f0efcda-2aa6-4795-aa45-ef4ac6dd0652', value: 'ACTIVE', label: 'Active', position: 0, color: 'green' },
        { id: 'f09eefc3-3e33-4435-b9f4-77d99d08b170', value: 'INACTIVE', label: 'Inactive', position: 1, color: 'gray' },
        { id: '41a8b369-a273-41bf-9204-83f997b4185d', value: 'PRE_ORDER', label: 'Pre-order', position: 2, color: 'yellow' },
        { id: 'b757c4d0-eb0a-4ec0-9a33-d393c290c5ab', value: 'FEATURED', label: 'Featured', position: 3, color: 'blue' },
      ],
    },
    { universalIdentifier: '0a8ff687-7845-48af-84b9-383c27b22a4a', type: FieldType.NUMBER, name: 'stockQuantity', label: 'Stock quantity', icon: 'IconPackages', defaultValue: 0 },
    { universalIdentifier: '7126708c-0b88-41a8-99b0-e7ef42f0f2f3', type: FieldType.NUMBER, name: 'cvAmount', label: 'CV amount', icon: 'IconChartBar', defaultValue: 0 },
    { universalIdentifier: '5accbd8a-73fe-48da-b490-e779980d8353', type: FieldType.TEXT, name: 'productUrl', label: 'Product URL', icon: 'IconWorld' },
    { universalIdentifier: '4925c4d3-2019-4914-9355-672d464ffa95', type: FieldType.DATE_TIME, name: 'lastSyncedAt', label: 'Last synced at', icon: 'IconRefresh', isNullable: true, defaultValue: null },
  ],
});
