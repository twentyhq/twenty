import { isDefined } from 'twenty-shared/utils';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentSection } from '@/settings/applications/utils/getApplicationContentSection';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

export const SettingsApplicationContentTypeIcon = ({
  contentType,
}: {
  contentType: ApplicationContentType;
}) => {
  const theme = useTheme();
  const { Icon } = APPLICATION_CONTENT_TYPE_CONFIGS[contentType];
  const sectionColor = getApplicationContentSection(contentType)?.color;

  return (
    <Icon
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.sm}
      color={
        isDefined(sectionColor)
          ? themeCssVariables.color[sectionColor]
          : theme.font.color.tertiary
      }
    />
  );
};
