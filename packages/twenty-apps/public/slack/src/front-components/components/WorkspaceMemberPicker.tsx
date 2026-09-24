import { isDefined } from 'twenty-sdk/utils';
import { useState } from 'react';

import { SearchDropdownPicker } from 'src/front-components/components/SearchDropdownPicker';
import { SlackPickedEntityButton } from 'src/front-components/components/SlackPickedEntityButton';
import { useWorkspaceMemberSearch } from 'src/front-components/hooks/use-workspace-member-search';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { getMemberDisplayName } from 'src/front-components/utils/get-member-display-name.util';

type WorkspaceMemberPickerProps = {
  selectedMember: WorkspaceMemberOption | null;
  onSelect: (member: WorkspaceMemberOption) => void;
  onClear: () => void;
  disabled?: boolean;
};

export const WorkspaceMemberPicker = ({
  selectedMember,
  onSelect,
  onClear,
  disabled,
}: WorkspaceMemberPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isReopening, setIsReopening] = useState(false);
  const { options, isSearching, searchErrorMessage } = useWorkspaceMemberSearch(
    { searchTerm },
  );

  if (isDefined(selectedMember)) {
    return (
      <SlackPickedEntityButton
        name={getMemberDisplayName(selectedMember)}
        meta={selectedMember.userEmail ?? undefined}
        avatar={{
          type: 'rounded',
          placeholder: getMemberDisplayName(selectedMember),
          placeholderColorSeed: selectedMember.id,
        }}
        changeLabel="Change the workspace member"
        onChangeRequest={() => {
          setIsReopening(true);
          onClear();
        }}
        disabled={disabled}
      />
    );
  }

  return (
    <SearchDropdownPicker
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      options={options}
      isSearching={isSearching}
      onSelect={(member) => {
        setIsReopening(false);
        onSelect(member);
      }}
      getOption={(member) => {
        const displayedName = getMemberDisplayName(member);

        return {
          key: member.id,
          name: displayedName,
          meta: member.userEmail ?? undefined,
          avatar: {
            type: 'rounded',
            placeholder: displayedName,
            placeholderColorSeed: member.id,
          },
        };
      }}
      searchLabel="Search a workspace member by name"
      emptyText={searchErrorMessage ?? 'No members found'}
      disabled={disabled}
      autoFocus={isReopening}
    />
  );
};
