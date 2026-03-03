import { registerEnumType } from '@nestjs/graphql';

export enum TimeFormat {
  SYSTEM = 'SYSTEM',
  HOUR_12 = 'HOUR_12',
  HOUR_24 = 'HOUR_24',
}

registerEnumType(TimeFormat, {
  name: 'TimeFormat',
  description: 'Time format',
});
