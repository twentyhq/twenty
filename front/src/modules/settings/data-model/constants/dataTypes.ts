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
  { label: string; Icon: IconComponent }
> = {
  NUMBER: { label: 'Number', Icon: IconNumbers },
  TEXT: { label: 'Text', Icon: IconTextSize },
  URL: { label: 'Link', Icon: IconLink },
  BOOLEAN: { label: 'True/False', Icon: IconCheck },
  RELATION: { label: 'Relation', Icon: IconPlug },
};
