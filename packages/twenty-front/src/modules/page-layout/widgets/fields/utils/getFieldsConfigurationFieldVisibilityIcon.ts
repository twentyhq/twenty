import {
  type IconComponent,
  IconEye,
  IconEyeOff,
  IconFilter,
} from 'twenty-ui/icon';

export const getFieldsConfigurationFieldVisibilityIcon = ({
  isVisible,
  hasConditionalDisplay,
}: {
  isVisible: boolean;
  hasConditionalDisplay: boolean;
}): IconComponent => {
  if (!isVisible) {
    return IconEyeOff;
  }

  if (hasConditionalDisplay) {
    return IconFilter;
  }

  return IconEye;
};
