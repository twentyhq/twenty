import { createElement } from 'react';

import {
  ObjectMetadataIcon,
  type ObjectMetadataIconInput,
} from '@/object-metadata/components/ObjectMetadataIcon';
import { type IconComponent } from 'twenty-ui/display';

export const getSelectOptionIconFromObjectMetadataItem = (
  objectMetadataItem: ObjectMetadataIconInput,
): IconComponent => {
  const SelectOptionObjectIcon: IconComponent = () =>
    createElement(ObjectMetadataIcon, { objectMetadataItem });

  return SelectOptionObjectIcon;
};
