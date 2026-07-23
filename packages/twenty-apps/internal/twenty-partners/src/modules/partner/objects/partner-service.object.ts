import { FieldType, defineObject } from 'twenty-sdk/define';

import { PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_SERVICE_TITLE_FIELD_ID =
  '31b8e0aa-a254-4d0d-a3db-bb56422f0d69';
export const PARTNER_SERVICE_DESCRIPTION_FIELD_ID =
  'dc1f7fa5-0468-4483-89a2-3da8362df86f';
export const PARTNER_SERVICE_SORT_ORDER_FIELD_ID =
  'dd8a1f0a-9039-4a95-9e29-685c28a44205';
export const PARTNER_SERVICE_POSITION_FIELD_ID =
  '1d0ff71b-17da-4260-b8ec-e4e992430547';

export default defineObject({
  universalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'partnerService',
  namePlural: 'partnerServices',
  labelSingular: 'Partner Service',
  labelPlural: 'Partner Services',
  description: 'Service offered by a partner',
  icon: 'IconTool',
  isSearchable: true,
  labelIdentifierFieldMetadataUniversalIdentifier: PARTNER_SERVICE_TITLE_FIELD_ID,
  fields: [
    {
      universalIdentifier: PARTNER_SERVICE_TITLE_FIELD_ID,
      type: FieldType.TEXT,
      name: 'title',
      label: 'Title',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: PARTNER_SERVICE_DESCRIPTION_FIELD_ID,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      icon: 'IconFileText',
      isNullable: true,
    },
    {
      // Partner-editable ordering for marketplace services. POSITION is system-managed
      // and not editable in the UI — partners set sortOrder instead.
      universalIdentifier: PARTNER_SERVICE_SORT_ORDER_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'sortOrder',
      label: 'Sort order',
      icon: 'IconSortAscending',
      isNullable: true,
    },
  ],
});
