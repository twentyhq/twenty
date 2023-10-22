import {
  IconCheck,
  IconLink,
  IconNumbers,
  IconPlug,
  IconSocial,
  IconTextSize,
  IconUserCircle,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { ObjectFieldDataType } from '../types/ObjectFieldDataType';

export const dataTypes: Record<
  ObjectFieldDataType,
  { label: string; Icon: IconComponent }
> = {
  number: { label: 'Number', Icon: IconNumbers },
  text: { label: 'Text', Icon: IconTextSize },
  link: { label: 'Link', Icon: IconLink },
  teammate: { label: 'Team member', Icon: IconUserCircle },
  boolean: { label: 'True/False', Icon: IconCheck },
  relation: { label: 'Relation', Icon: IconPlug },
  social: { label: 'Social', Icon: IconSocial },
};
