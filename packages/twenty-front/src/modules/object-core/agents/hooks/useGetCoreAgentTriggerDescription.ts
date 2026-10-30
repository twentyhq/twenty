import { useLingui } from '@lingui/react/macro';
import { type AgentTrigger } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { splitWorkflowTriggerEventName } from '@/workflow/utils/splitWorkflowTriggerEventName';
import { describeCronExpression } from '~/utils/cron-to-human/describeCronExpression';

export const useGetCoreAgentTriggerDescription = () => {
  const { t } = useLingui();
  const { timeFormat } = useDateTimeFormat();
  const dateLocale = useAtomStateValue(dateLocaleState);
  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const getTriggerDetails = (trigger: AgentTrigger) => {
    if (trigger.type === 'CRON') {
      try {
        return describeCronExpression(
          trigger.settings.pattern,
          { use24HourTimeFormat: timeFormat === TimeFormat.HOUR_24 },
          dateLocale.localeCatalog,
        );
      } catch {
        return trigger.settings.pattern;
      }
    }

    const { objectType } = splitWorkflowTriggerEventName(
      trigger.settings.eventName,
    );
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === objectType,
    );

    if (!isDefined(objectMetadataItem)) {
      return trigger.settings.eventName;
    }

    const objectLabel = objectMetadataItem.labelPlural;
    const fieldLabels = (trigger.settings.updatedFields ?? []).map(
      (fieldName) =>
        (
          objectMetadataItem.fields.find(({ name }) => name === fieldName) ??
          objectMetadataItem.fields.find(
            ({ name }) => `${name}Id` === fieldName,
          )
        )?.label ?? fieldName,
    );

    return isNonEmptyArray(fieldLabels)
      ? `${objectLabel} · ${fieldLabels.join(', ')}`
      : objectLabel;
  };

  const getCoreAgentTriggerDescription = (trigger: AgentTrigger) => {
    const details = getTriggerDetails(trigger);

    return trigger.isActive ? details : t`${details} · Paused`;
  };

  return { getCoreAgentTriggerDescription };
};
