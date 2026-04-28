import {
  defineView,
  ViewKey,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  CONTRIBUTOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  CONTRIBUTOR_GH_LOGIN_FIELD_UNIVERSAL_IDENTIFIER,
  CONTRIBUTOR_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/github/contributor/objects/contributor.object';

export const ALL_CONTRIBUTORS_VIEW_UNIVERSAL_IDENTIFIER =
  'e2b51f8e-97ea-49e0-b38d-a69d2191236f';

export default defineView({
  universalIdentifier: ALL_CONTRIBUTORS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All Contributors',
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconUsers',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'b53cb9dd-0e2e-415e-81af-80bedbed89bc',
      fieldMetadataUniversalIdentifier:
        CONTRIBUTOR_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '604a2f1d-ef20-4821-8742-fe3b5b83ffcf',
      fieldMetadataUniversalIdentifier:
        CONTRIBUTOR_GH_LOGIN_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 150,
    },
  ],
  sorts: [
    {
      universalIdentifier: 'c0c54264-8de9-418b-b91a-cc4a2b94c539',
      fieldMetadataUniversalIdentifier:
        CONTRIBUTOR_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
