import { useComposeCalendarEventForTargetRecord } from '@/activities/calendar/hooks/useComposeCalendarEventForTargetRecord';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const useComposeCalendarEventRelatedRecordAction = (
  targetRecord: ActivityTargetableObject,
): RelatedRecordActionBinding => {
  const { t } = useLingui();
  const { openComposer, disabled, loading } =
    useComposeCalendarEventForTargetRecord(targetRecord);
  const canCreateCalendarEvent = useHasPermissionFlag(
    PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
  );

  const disabledReason = (() => {
    if (!disabled || loading) {
      return undefined;
    }

    switch (targetRecord.targetObjectNameSingular) {
      case StandardObjectNameSingular.Person:
        return t`Add an email to this person first`;
      case StandardObjectNameSingular.Company:
        return t`Add a person with an email to this company first`;
      case StandardObjectNameSingular.Opportunity:
        return t`Add an email to the point of contact first`;
      default:
        return t`Calendar events cannot be linked to this record type`;
    }
  })();

  return {
    action: {
      id: 'create-calendar-event',
      label: t`Create calendar event`,
      Icon: IconCalendarEvent,
      isVisible: canCreateCalendarEvent,
      disabled,
      disabledReason,
      execute: openComposer,
    },
  };
};
