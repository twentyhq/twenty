import { isDefined } from 'twenty-shared/utils';
import { IconCode, IconFunction, useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';

type SettingsValidationRuleHelperItemIconProps = {
  item: ValidationRuleHelperItem;
};

export const SettingsValidationRuleHelperItemIcon = ({
  item,
}: SettingsValidationRuleHelperItemIconProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  if (item.kind === 'function') {
    return <IconFunction size={theme.icon.size.md} />;
  }

  if (item.kind === 'keyword') {
    return <IconCode size={theme.icon.size.md} />;
  }

  const TypeIcon = isFieldTypeSupportedInSettings(item.field.type)
    ? getSettingsFieldTypeConfig(item.field.type)?.Icon
    : undefined;

  if (isDefined(TypeIcon)) {
    return <TypeIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
  }

  const FieldIcon = getIcon(item.field.iconName);

  return <FieldIcon size={theme.icon.size.md} />;
};
