import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export const PERSON_XOPURE_CORE_TAGS_FIELD_ID =
  'c12fd224-4f8d-42db-908b-a6de31a24a38';

export default defineField({
  universalIdentifier: PERSON_XOPURE_CORE_TAGS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.MULTI_SELECT,
  name: 'xopureCoreTags',
  label: 'XO Pure core tags',
  description:
    'Primary segmentation tags separating customers, ambassadors, orders/commission participants, and prospects.',
  icon: 'IconTags',
  defaultValue: [],
  options: [
    { id: 'da247f13-593b-48ef-a415-81de4ad4ce13', value: 'CUSTOMER', label: 'Customer', position: 0, color: 'green' },
    { id: 'd83306fa-7c8f-43f7-8dd0-bc2933cc460a', value: 'AMBASSADOR', label: 'Ambassador', position: 1, color: 'blue' },
    { id: 'e2e52596-f80e-4203-b380-740492855760', value: 'RETAIL_PROSPECT', label: 'Retail prospect', position: 2, color: 'yellow' },
    { id: '2b5354bd-6ca8-46ff-a623-589d503495a7', value: 'INFLUENCER_PROSPECT', label: 'Influencer prospect', position: 3, color: 'purple' },
    { id: '6826ab8e-bae3-483d-bd4d-5e641fcb503b', value: 'ORDER_CONTACT', label: 'Order contact', position: 4, color: 'turquoise' },
    { id: 'dfbb295a-f600-48cf-b145-acece3dd7d1e', value: 'COMMISSION_CONTACT', label: 'Commission contact', position: 5, color: 'orange' },
  ],
});
