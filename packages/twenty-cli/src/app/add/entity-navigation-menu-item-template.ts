import { randomUUID } from 'node:crypto';

import { printTypescriptValue } from '@/app/pull/print-typescript-value';

export const getNavigationMenuItemBaseFile = ({
  name,
  objectUniversalIdentifier,
}: {
  name: string;
  objectUniversalIdentifier: string;
}) => `import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export default defineNavigationMenuItem({
  universalIdentifier: '${randomUUID()}',
  name: ${printTypescriptValue({ value: name })},
  icon: 'IconCompass',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: '${objectUniversalIdentifier}',
});
`;
