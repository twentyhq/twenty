import { registerEnumType } from '@nestjs/graphql';

export enum NumberFormat {
  SYSTEM = 'SYSTEM',
  COMMAS_AND_DOT = 'COMMAS_AND_DOT',
  SPACES_AND_COMMA = 'SPACES_AND_COMMA',
  DOTS_AND_COMMA = 'DOTS_AND_COMMA',
  APOSTROPHE_AND_DOT = 'APOSTROPHE_AND_DOT',
}

registerEnumType(NumberFormat, {
  name: 'NumberFormat',
  description: 'Number format',
});
