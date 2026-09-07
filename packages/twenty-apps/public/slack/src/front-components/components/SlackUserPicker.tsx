import { useState } from 'react';

import { SearchDropdownPicker } from 'src/front-components/components/SearchDropdownPicker';
import { useSlackUserSearch } from 'src/front-components/hooks/use-slack-user-search';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

type SlackUserPickerProps = {
  onSelect: (slackUser: SlackResolvedUser) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export const SlackUserPicker = ({
  onSelect,
  disabled,
  autoFocus,
}: SlackUserPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { options, isSearching, searchErrorMessage } =
    useSlackUserSearch(searchTerm);

  return (
    <SearchDropdownPicker
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      options={options}
      isSearching={isSearching}
      onSelect={onSelect}
      getOptionKey={(slackUser) => slackUser.slackUserId}
      getOptionName={(slackUser) =>
        slackUser.displayName ?? slackUser.slackUserId
      }
      getOptionMeta={(slackUser) => slackUser.email}
      searchLabel="Search Slack by name or email"
      emptyText={
        searchErrorMessage ??
        'No Slack users found. For a guest or Slack Connect user, link by Slack ID below.'
      }
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
};
