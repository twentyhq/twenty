import { defineView, ViewKey } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER, NAME_FIELD_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export const EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER = '965e3776-b966-4be8-83f7-6cd3bce5e1bd';

export default defineView({
  universalIdentifier: EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All example items',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  key: ViewKey.INDEX,
  position: 0,
  fields: [
    {
      universalIdentifier: 'f926bdb7-6af7-4683-9a09-adbca56c29f0',
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});
