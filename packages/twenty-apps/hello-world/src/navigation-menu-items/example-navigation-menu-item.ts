import { defineNavigationMenuItem } from 'twenty-sdk';
  import { EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/example-view';

export default defineNavigationMenuItem({
  universalIdentifier: '10f90627-e9c2-44b7-9742-bed77e3d1b17',
  name: 'example-navigation-menu-item',
  icon: 'IconList',
  color: 'blue',
  position: 0,
  viewUniversalIdentifier: EXAMPLE_VIEW_UNIVERSAL_IDENTIFIER,
});
