import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';
import { useWorkspaceMemberSearch } from 'src/front-components/hooks/use-workspace-member-search';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
`;

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

const StyledDropdown = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-shadow: ${() => themeCssVariables.boxShadow.light};
  box-sizing: border-box;
  left: 0;
  margin-top: ${() => themeCssVariables.spacing[1]};
  max-height: 240px;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 1;
`;

const StyledOption = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${() => themeCssVariables.background.secondary};
  }
`;

const StyledOptionName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledOptionEmail = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledEmptyState = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[2]};
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
  const [isFocused, setIsFocused] = useState(false);
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

  const hasSearchTerm = isNonEmptyString(searchTerm.trim());
  const isDropdownOpen = isFocused && hasSearchTerm;

  const handleSelect = (member: WorkspaceMemberOption) => {
    setSearchTerm('');
    onSelect(member);
  };

  return (
    <StyledContainer>
      <SlackUserLinkTextInput
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // Enter picks the top match instead of submitting the form the search
        // sits in, which would silently do nothing for a partial name.
        onKeyDown={(event) => {
          if (event.key !== 'Enter') {
            return;
          }

          event.preventDefault();

          if (options.length > 0) {
            handleSelect(options[0]);
          }
        }}
        placeholder="Search a workspace member by name"
        disabled={disabled}
        autoFocus={isReopening}
        aria-label="Search a workspace member by name"
      />
      {isDropdownOpen && (
        <StyledDropdown>
          {options.map((member) => (
            <StyledOption
              key={member.id}
              type="button"
              // Select on mousedown: the input's blur fires before a click would,
              // closing the dropdown and unmounting this option, so onClick never
              // runs in the front-component sandbox. preventDefault keeps focus.
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(member);
              }}
            >
              <StyledOptionName>
                {isNonEmptyString(member.name) ? member.name : member.id}
              </StyledOptionName>
              {isNonEmptyString(member.userEmail) && (
                <StyledOptionEmail>{member.userEmail}</StyledOptionEmail>
              )}
            </StyledOption>
          ))}
          {options.length === 0 && (
            <StyledEmptyState>
              {isSearching ? 'Searching…' : 'No members found'}
            </StyledEmptyState>
          )}
        </StyledDropdown>
      )}
    </StyledContainer>
  );
};
