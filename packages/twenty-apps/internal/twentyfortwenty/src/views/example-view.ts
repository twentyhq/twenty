import { defineView } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export default defineView({
  universalIdentifier: '654b59d7-d3e4-47ff-9f2f-8ec3fb94a4e8',
  name: 'example-view',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  position: 0,
});
