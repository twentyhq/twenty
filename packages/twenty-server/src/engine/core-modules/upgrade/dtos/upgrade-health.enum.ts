import { registerEnumType } from '@nestjs/graphql';

import { UpgradeHealthEnum } from 'twenty-shared/types';

export { UpgradeHealthEnum };

registerEnumType(UpgradeHealthEnum, {
  name: 'UpgradeHealth',
});
