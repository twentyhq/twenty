import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';

import { SearchDropdownPicker } from 'src/front-components/components/SearchDropdownPicker';
import { useSlackChannelSearch } from 'src/front-components/hooks/use-slack-channel-search';
import { type SlackChannelSearchOption } from 'src/logic-functions/types/slack-channel-search.type';

const getChannelMeta = (channel: SlackChannelSearchOption): string =>
  [
    channel.isPrivate ? 'Private' : 'Public',
    channel.isMember ? undefined : 'Bot is not a member yet',
  ]
    .filter(isDefined)
    .join(' · ');

type SlackChannelPickerProps = {
  onSelect: (channel: SlackChannelSearchOption) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export const SlackChannelPicker = ({
  onSelect,
  disabled,
  autoFocus,
}: SlackChannelPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { options, isSearching, searchErrorMessage } =
    useSlackChannelSearch(searchTerm);

  return (
    <SearchDropdownPicker
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      options={options}
      isSearching={isSearching}
      onSelect={onSelect}
      getOption={(channel) => ({
        key: channel.slackChannelId,
        name: `#${channel.name}`,
        meta: getChannelMeta(channel),
      })}
      searchLabel="Search Slack channels by name"
      emptyText={
        searchErrorMessage ??
        'No channels found. Private channels only appear once the bot has been added to them.'
      }
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
};
