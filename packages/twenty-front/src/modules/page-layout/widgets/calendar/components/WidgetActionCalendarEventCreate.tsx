import { useComposeCalendarEventForTargetRecord } from '@/activities/calendar/hooks/useComposeCalendarEventForTargetRecord';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const WidgetActionCalendarEventCreate = () => {
  const { openComposer, disabled } = useComposeCalendarEventForTargetRecord();
  const hasCreateCalendarEventPermission = useHasPermissionFlag(
    PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
  );

  if (!hasCreateCalendarEventPermission) {
    return null;
  }

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={t`Create event`}
      onClick={openComposer}
      disabled={disabled}
    />
  );
};
