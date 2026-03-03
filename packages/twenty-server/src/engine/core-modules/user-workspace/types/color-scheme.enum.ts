import { registerEnumType } from '@nestjs/graphql';

export enum ColorScheme {
  DARK = 'DARK',
  LIGHT = 'LIGHT',
  SYSTEM = 'SYSTEM',
}

registerEnumType(ColorScheme, {
  name: 'ColorScheme',
  description: 'Color scheme',
});
