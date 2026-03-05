import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export const TabAvatar = ({ tab }: { tab: SingleTabProps }) => {
  if (isDefined(tab.logo)) {
    return <Avatar avatarUrl={tab.logo} size="md" placeholder={tab.title} />;
  }
  return (
    tab.Icon && (
      <tab.Icon
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
        color={
          tab.disabled
            ? resolveThemeVariable(themeCssVariables.font.color.tertiary)
            : resolveThemeVariable(themeCssVariables.font.color.secondary)
        }
        stroke={resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.md)}
      />
    )
  );
};
