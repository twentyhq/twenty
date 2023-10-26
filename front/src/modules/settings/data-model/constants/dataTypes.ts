import {
  IconCheck,
  IconLink,
  IconNumbers,
  IconPlug,
  IconTextSize,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { ObjectFieldDataType } from '../types/ObjectFieldDataType';

export const dataTypes: Record<
  ObjectFieldDataType,
  { label: string; Icon: IconComponent }
> = {
  number: { label: 'Number', Icon: IconNumbers },
  text: { label: 'Text', Icon: IconTextSize },
  url: { label: 'Link', Icon: IconLink },
  boolean: { label: 'True/False', Icon: IconCheck },
  relation: { label: 'Relation', Icon: IconPlug },
};
