import {
  IconCheck,
  IconCoins,
  IconLink,
  IconNumbers,
  IconPlug,
  IconTextSize,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Currency } from '~/generated-metadata/graphql';

import { MetadataFieldDataType } from '../types/ObjectFieldDataType';

export const dataTypes: Record<
  MetadataFieldDataType,
  { label: string; Icon: IconComponent; defaultValue?: unknown }
> = {
  BOOLEAN: { label: 'True/False', Icon: IconCheck, defaultValue: true },
  MONEY: {
    label: 'Currency',
    Icon: IconCoins,
    defaultValue: { amount: 2000, currency: Currency.Usd },
  },
  NUMBER: { label: 'Number', Icon: IconNumbers, defaultValue: 2000 },
  RELATION: { label: 'Relation', Icon: IconPlug },
  TEXT: {
    label: 'Text',
    Icon: IconTextSize,
    defaultValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
  },
  URL: { label: 'Link', Icon: IconLink },
};
