import { defineView } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export default defineView({
  universalIdentifier: '9c9c09bb-de9f-4248-89f2-e7d91f29c3ed',
  name: 'example-view',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  position: 0,
});
