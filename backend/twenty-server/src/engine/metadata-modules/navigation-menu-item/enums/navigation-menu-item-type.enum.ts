import { registerEnumType } from '@nestjs/graphql';

import { NavigationMenuItemType } from 'twenty-shared/types';

registerEnumType(NavigationMenuItemType, {
  name: 'NavigationMenuItemType',
});

export { NavigationMenuItemType };
