import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  ENGINEER_UNIVERSAL_IDENTIFIER,
  ENGINEER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  ENGINEER_GH_LOGIN_FIELD_UNIVERSAL_IDENTIFIER,
  ENGINEER_IS_CORE_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
  ENGINEER_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/engineer/objects/engineer.object';

export const EXTERNAL_CONTRIBUTORS_VIEW_UNIVERSAL_IDENTIFIER =
  '005d967b-3a71-4bfd-99d4-a1826384bd3b';

export default defineView({
  universalIdentifier: EXTERNAL_CONTRIBUTORS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'External Contributors',
  objectUniversalIdentifier: ENGINEER_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconWorld',
  position: 2,
  filters: [
    {
      universalIdentifier: 'd166ec9f-cb2f-4029-a957-625fed553ed9',
      fieldMetadataUniversalIdentifier:
        ENGINEER_IS_CORE_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: 'false',
    },
  ],
  fields: [
    {
      universalIdentifier: '78aa6e8f-33a7-462e-bdb4-fb1164dbbc1d',
      fieldMetadataUniversalIdentifier:
        ENGINEER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '89c773a5-8dcb-4f55-bf7c-d55897ba20aa',
      fieldMetadataUniversalIdentifier:
        ENGINEER_GH_LOGIN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 150,
    },
  ],
  sorts: [
    {
      universalIdentifier: 'f605e62d-eceb-464d-bf88-0fb93d3c414b',
      fieldMetadataUniversalIdentifier:
        ENGINEER_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
