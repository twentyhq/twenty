import { useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';

import { SearchDropdownPicker } from 'src/features/chat/front-components/SearchDropdownPicker';
import { type TeamsUserSearchOption } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';
import { useTeamsUserSearch } from 'src/features/chat/front-components/hooks/use-teams-user-search';

type TeamsUserPickerProps = {
  onSelect: (teamsUser: TeamsUserSearchOption) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export const TeamsUserPicker = ({
  onSelect,
  disabled,
  autoFocus,
}: TeamsUserPickerProps) => {
  const { t } = useTranslate();
  const [searchTerm, setSearchTerm] = useState('');
  const { options, isSearching, searchErrorMessage } =
    useTeamsUserSearch(searchTerm);

  return (
    <SearchDropdownPicker
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      options={options}
      isSearching={isSearching}
      onSelect={onSelect}
      getOptionKey={(teamsUser) => teamsUser.teamsUserAadObjectId}
      getOptionName={(teamsUser) =>
        teamsUser.displayName ?? teamsUser.teamsUserAadObjectId
      }
      getOptionMeta={(teamsUser) => teamsUser.email}
      searchLabel={t('Search Teams by name or email')}
      emptyText={searchErrorMessage ?? t('No matching Teams users found.')}
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
};
