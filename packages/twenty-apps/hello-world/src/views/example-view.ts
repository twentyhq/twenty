import { defineView } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export default defineView({
  universalIdentifier: '300bf7bf-9d0f-4ff8-b636-cdcd247b9272',
  name: 'example-view',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  position: 0,
});
