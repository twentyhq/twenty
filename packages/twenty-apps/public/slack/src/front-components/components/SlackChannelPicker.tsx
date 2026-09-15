import { useState } from 'react';

import { SearchDropdownPicker } from 'src/front-components/components/SearchDropdownPicker';
import { useSlackChannelSearch } from 'src/front-components/hooks/use-slack-channel-search';
import { type SlackChannelSearchOption } from 'src/logic-functions/types/slack-channel-search.type';

const getChannelMeta = (channel: SlackChannelSearchOption): string =>
  [
    channel.isPrivate ? 'Private' : 'Public',
    channel.isMember ? undefined : 'Bot is not a member yet',
  ]
    .filter((part) => part !== undefined)
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
      getOptionKey={(channel) => channel.slackChannelId}
      getOptionName={(channel) => `#${channel.name}`}
      getOptionMeta={getChannelMeta}
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
