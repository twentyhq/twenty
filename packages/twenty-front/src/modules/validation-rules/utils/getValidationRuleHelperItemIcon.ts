import { IconCode, IconFunction, type IconComponent } from 'twenty-ui/icon';

import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';

export const getValidationRuleHelperItemIcon = ({
  item,
  getIcon,
}: {
  item: ValidationRuleHelperItem;
  getIcon: (iconKey?: string | null) => IconComponent;
}): IconComponent => {
  switch (item.kind) {
    case 'function':
      return IconFunction;
    case 'keyword':
      return IconCode;
    case 'field':
      return getIcon(item.field.iconName);
  }
};
