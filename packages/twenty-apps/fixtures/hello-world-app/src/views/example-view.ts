import { defineView } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER, NAME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export const EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER = 'e004df40-29f3-47ba-b39d-d3a5c444367a';

export default defineView({
  universalIdentifier: EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All example items',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  key: 'INDEX',
  position: 0,
  fields: [
    {
      universalIdentifier: '496c40c2-5766-419c-93bf-20fdad3f34bb',
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});
