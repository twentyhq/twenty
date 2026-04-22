import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  CONTRIBUTOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONTRIBUTOR_GH_LOGIN_FIELD_UNIVERSAL_IDENTIFIER,
  CONTRIBUTOR_IS_CORE_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
  CONTRIBUTOR_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/contributor/objects/contributor.object';

export const CORE_TEAM_VIEW_UNIVERSAL_IDENTIFIER =
  'ecf37323-3f43-4792-a42e-9b24454c168d';

export default defineView({
  universalIdentifier: CORE_TEAM_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Core Team',
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconShieldCheck',
  position: 1,
  filters: [
    {
      universalIdentifier: '7d8afc95-8f23-44c7-89c1-39ffa9e66a3c',
      fieldMetadataUniversalIdentifier:
        CONTRIBUTOR_IS_CORE_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: 'true',
    },
  ],
  fields: [
    {
      universalIdentifier: '528217eb-0dfe-4e74-a988-7cfad48b623e',
      fieldMetadataUniversalIdentifier:
        CONTRIBUTOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '1a0a2ff2-58b4-444b-b2ca-45cfd58fd767',
      fieldMetadataUniversalIdentifier:
        CONTRIBUTOR_GH_LOGIN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 150,
    },
  ],
  sorts: [
    {
      universalIdentifier: 'f1bddd43-bcef-4173-9414-bd112df62d4e',
      fieldMetadataUniversalIdentifier:
        CONTRIBUTOR_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
