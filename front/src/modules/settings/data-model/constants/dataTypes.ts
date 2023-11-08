import {
  IconCheck,
  IconLink,
  IconNumbers,
  IconPlug,
  IconTextSize,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { MetadataFieldDataType } from '../types/ObjectFieldDataType';

export const dataTypes: Record<
  MetadataFieldDataType,
  { label: string; Icon: IconComponent; defaultValue?: unknown }
> = {
  NUMBER: { label: 'Number', Icon: IconNumbers, defaultValue: 2000 },
  TEXT: {
    label: 'Text',
    Icon: IconTextSize,
    defaultValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
  },
  URL: { label: 'Link', Icon: IconLink },
  BOOLEAN: { label: 'True/False', Icon: IconCheck, defaultValue: true },
  RELATION: { label: 'Relation', Icon: IconPlug },
};
