import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SearchDropdownPicker } from 'src/front-components/components/SearchDropdownPicker';
import { useWorkspaceMemberSearch } from 'src/front-components/hooks/use-workspace-member-search';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';

const StyledSelectedMember = styled.button`
  align-items: center;
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  padding: ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover:enabled {
    border-color: ${() => themeCssVariables.color.blue};
  }

  &:disabled {
    cursor: default;
  }
`;

const StyledSelectedMemberLabel = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

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
  // True after the selection is clicked open, so the returning search input
  // takes focus; never on first render, which would steal the page focus.
  const [isReopening, setIsReopening] = useState(false);
  const { options, isSearching } = useWorkspaceMemberSearch(searchTerm);

  if (isDefined(selectedMember)) {
    return (
      <StyledSelectedMember
        type="button"
        onClick={() => {
          setIsReopening(true);
          onClear();
        }}
        disabled={disabled}
        aria-label="Change the workspace member"
      >
        <StyledSelectedMemberLabel>
          {isNonEmptyString(selectedMember.name)
            ? selectedMember.name
            : (selectedMember.userEmail ?? selectedMember.id)}
        </StyledSelectedMemberLabel>
      </StyledSelectedMember>
    );
  }

  return (
    <SearchDropdownPicker
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      options={options}
      isSearching={isSearching}
      onSelect={onSelect}
      getOptionKey={(member) => member.id}
      getOptionName={(member) =>
        isNonEmptyString(member.name) ? member.name : member.id
      }
      getOptionMeta={(member) => member.userEmail ?? undefined}
      searchLabel="Search a workspace member by name"
      emptyText="No members found"
      disabled={disabled}
      autoFocus={isReopening}
    />
  );
};
