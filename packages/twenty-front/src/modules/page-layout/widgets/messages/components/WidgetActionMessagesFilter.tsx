import { MessageChannelLogo } from '@/activities/emails/components/MessageChannelLogo';
import { useMessageChannelLabel } from '@/activities/emails/hooks/useMessageChannelLabel';
import { useTimelineThreadChannels } from '@/activities/emails/hooks/useTimelineThreadChannels';
import { timelineThreadChannelFilterFamilyState } from '@/activities/emails/states/timelineThreadChannelFilterFamilyState';
import { getTimelineThreadChannelFilterKey } from '@/activities/emails/utils/getTimelineThreadChannelFilterKey';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter, IconMessage } from 'twenty-ui/icon';

export const WidgetActionMessagesFilter = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { getMessageChannelLabel } = useMessageChannelLabel();
  const { timelineThreadChannels } = useTimelineThreadChannels(targetRecord);
  const [timelineThreadChannelFilter, setTimelineThreadChannelFilter] =
    useAtomFamilyState(timelineThreadChannelFilterFamilyState, targetRecord.id);

  const isFiltered = isDefined(timelineThreadChannelFilter);

  if (timelineThreadChannels.length < 2 && !isFiltered) {
    return null;
  }

  const selectedChannelKey = isFiltered
    ? getTimelineThreadChannelFilterKey(timelineThreadChannelFilter)
    : null;

  const channelOptions = timelineThreadChannels
    .map(({ type, provider, applicationId }) => ({
      channel: { type, provider, applicationId: applicationId ?? null },
      label: getMessageChannelLabel({ provider, applicationId }),
    }))
    .sort((first, second) => first.label.localeCompare(second.label));

  const filterLabel = t`Filter conversations`;
  const selectedChannelLabel = isFiltered
    ? getMessageChannelLabel(timelineThreadChannelFilter)
    : null;
  const label = isDefined(selectedChannelLabel)
    ? `${filterLabel} · ${selectedChannelLabel}`
    : filterLabel;

  return (
    <DropdownRoot
      dropdownId={`widget-action-messages-filter-${targetRecord.id}`}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <WidgetCardHeaderActionButton
            Icon={IconFilter}
            label={label}
            color={isFiltered ? 'accent' : 'neutral'}
          />
        }
      />
      <DropdownContent
        width={GenericDropdownContentWidth.Large}
        align="end"
        aria-label={filterLabel}
      >
        <Dropdown.Section scrollable>
          <Dropdown.OptionItem
            startIcon={<IconMessage />}
            selected={!isFiltered}
            onSelect={() => setTimelineThreadChannelFilter(null)}
          >
            {t`All conversations`}
          </Dropdown.OptionItem>
          {channelOptions.map(({ channel, label: channelLabel }) => {
            const channelKey = getTimelineThreadChannelFilterKey(channel);

            return (
              <Dropdown.OptionItem
                key={channelKey}
                startIcon={<MessageChannelLogo channel={channel} />}
                selected={channelKey === selectedChannelKey}
                onSelect={() => setTimelineThreadChannelFilter(channel)}
              >
                {channelLabel}
              </Dropdown.OptionItem>
            );
          })}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
