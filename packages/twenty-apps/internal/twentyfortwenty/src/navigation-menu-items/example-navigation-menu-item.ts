import { defineNavigationMenuItem } from 'twenty-sdk';

export default defineNavigationMenuItem({
  universalIdentifier: '64d5b7ca-0e0d-4c35-a7ee-7e903d1a3fd5',
  name: 'example-navigation-menu-item',
  icon: 'IconList',
  position: 0,
  // Link to a view:
  // viewUniversalIdentifier: '...',
  // Or link to an object:
  // targetObjectUniversalIdentifier: '...',
  // Or link to an external URL:
  // link: 'https://example.com',
});
