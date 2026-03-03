import { defineView } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export default defineView({
  universalIdentifier: '6699b44a-dad0-4cb7-b518-80d3d9af854e',
  name: 'example-view',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  position: 0,
});
