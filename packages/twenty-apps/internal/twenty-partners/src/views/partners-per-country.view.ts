import {
  AggregateOperations,
  ViewSortDirection,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { PARTNER_COUNTRY_VIEW_GROUPS } from 'src/constants/partner-country-view-groups';
import {
  PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_REGION_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_VALIDATION_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/partner-field-universal-identifiers';
import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNERS_PER_COUNTRY_VIEW_UNIVERSAL_IDENTIFIER =
  '35ef1b2f-f501-459e-a0e8-2f3d071f002d';

export default defineView({
  universalIdentifier: PARTNERS_PER_COUNTRY_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partners per Country',
  icon: 'IconMap',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 1,
  mainGroupByFieldMetadataUniversalIdentifier:
    PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
  kanbanAggregateOperation: AggregateOperations.COUNT,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier:
    PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  shouldHideEmptyGroups: true,
  groups: [...PARTNER_COUNTRY_VIEW_GROUPS],
  fields: [
    {
      universalIdentifier: '7ba5125f-57ec-41c6-813e-d8d8e59cfe94',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '938649bf-bfd5-4a97-a318-e76dbcc217bc',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '11680e09-fc3f-46fd-a36a-dc84afc2d0f6',
      fieldMetadataUniversalIdentifier: PARTNER_REGION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '006255c0-aa2c-4228-b55f-9807b91d9bc1',
      fieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
    },
  ],
  sorts: [
    {
      universalIdentifier: 'b4ba64d8-6279-49a2-a137-3b1e4f710a82',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.ASC,
    },
  ],
});
