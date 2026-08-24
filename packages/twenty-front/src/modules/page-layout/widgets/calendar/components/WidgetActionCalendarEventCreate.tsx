import { useComposeCalendarEventForTargetRecord } from '@/activities/calendar/hooks/useComposeCalendarEventForTargetRecord';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const WidgetActionCalendarEventCreate = () => {
  const targetRecord = useTargetRecord();
  const { openComposer, disabled, loading } =
    useComposeCalendarEventForTargetRecord();
  const hasCreateCalendarEventPermission = useHasPermissionFlag(
    PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
  );

  if (!hasCreateCalendarEventPermission) {
    return null;
  }

  const disabledLabel = (() => {
    if (!disabled || loading) {
      return t`Create event`;
    }

    switch (targetRecord.targetObjectNameSingular) {
      case CoreObjectNameSingular.Person:
        return t`Add an email to this person first`;
      case CoreObjectNameSingular.Company:
        return t`Add a person with an email to this company first`;
      case CoreObjectNameSingular.Opportunity:
        return t`Add an email to the point of contact first`;
      default:
        return t`Calendar events cannot be linked to this record type`;
    }
  })();

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={disabledLabel}
      onClick={openComposer}
      disabled={disabled}
    />
  );
};
