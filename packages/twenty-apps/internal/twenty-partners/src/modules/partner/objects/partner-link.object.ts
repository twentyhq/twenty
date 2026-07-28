import { FieldType, defineObject } from 'twenty-sdk/define';

import { PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_LINK_NAME_FIELD_ID = '15aeb279-e836-491c-84a4-58a6da8685c7';
export const PARTNER_LINK_URL_FIELD_ID = 'e28d8614-f6d4-4da8-8543-4b233b7ec070';
export const PARTNER_LINK_SORT_ORDER_FIELD_ID =
  '197a4153-ab7b-4c9b-87ab-3a6d849a0229';
export const PARTNER_LINK_POSITION_FIELD_ID =
  'a770d910-1653-4707-8ab3-b3041fb6527c';

export default defineObject({
  universalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'partnerLink',
  namePlural: 'partnerLinks',
  labelSingular: 'Partner Link',
  labelPlural: 'Partner Links',
  description: 'Curated link shown on a partner profile',
  icon: 'IconLink',
  isSearchable: true,
  labelIdentifierFieldMetadataUniversalIdentifier: PARTNER_LINK_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: PARTNER_LINK_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: PARTNER_LINK_URL_FIELD_ID,
      type: FieldType.LINKS,
      name: 'url',
      label: 'URL',
      icon: 'IconWorldWww',
      isNullable: true,
    },
    {
      // Partner-editable ordering for marketplace profile links. POSITION is system-managed
      // and not editable in the UI — partners set sortOrder instead.
      universalIdentifier: PARTNER_LINK_SORT_ORDER_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'sortOrder',
      label: 'Sort order',
      icon: 'IconSortAscending',
      isNullable: true,
    },
  ],
});
