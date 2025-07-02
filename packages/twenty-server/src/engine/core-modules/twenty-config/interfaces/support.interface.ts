import { registerEnumType } from '@nestjs/graphql';

export enum SupportDriver {
  NONE = 'NONE',
  FRONT = 'FRONT',
}

registerEnumType(SupportDriver, {
  name: 'SupportDriver',
});
