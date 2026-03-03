import { defineNavigationMenuItem } from 'twenty-sdk';

export default defineNavigationMenuItem({
  universalIdentifier: '7b88edc9-2318-401f-bff1-102a88be7fa3',
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
