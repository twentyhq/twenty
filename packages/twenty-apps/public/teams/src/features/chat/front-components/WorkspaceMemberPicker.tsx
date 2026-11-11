import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';

import { PickedEntityButton } from 'src/features/chat/front-components/PickedEntityButton';
import { SearchDropdownPicker } from 'src/features/chat/front-components/SearchDropdownPicker';
import { type WorkspaceMemberOption } from 'src/features/chat/front-components/types/workspace-member-option.type';
import { getMemberDisplayName } from 'src/features/chat/front-components/utils/get-member-display-name.util';
import { useWorkspaceMemberSearch } from 'src/features/chat/front-components/hooks/use-workspace-member-search';

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
  const { t } = useTranslate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isReopening, setIsReopening] = useState(false);
  const { options, isSearching, searchErrorMessage } = useWorkspaceMemberSearch(
    { searchTerm },
  );

  if (isDefined(selectedMember)) {
    return (
      <PickedEntityButton
        name={getMemberDisplayName(selectedMember)}
        changeLabel={t('Change the workspace member')}
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
      getOptionKey={(member) => member.id}
      getOptionName={(member) =>
        isNonEmptyString(member.name) ? member.name : member.id
      }
      getOptionMeta={(member) => member.userEmail ?? undefined}
      searchLabel={t('Search a workspace member by name')}
      emptyText={searchErrorMessage ?? t('No members found')}
      disabled={disabled}
      autoFocus={isReopening}
    />
  );
};
