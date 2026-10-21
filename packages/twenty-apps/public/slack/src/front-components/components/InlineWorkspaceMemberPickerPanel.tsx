import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useWorkspaceMemberSearch } from 'src/front-components/hooks/use-workspace-member-search';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { getMemberDisplayName } from 'src/front-components/utils/get-member-display-name.util';

const StyledBackdrop = styled.div`
  inset: 0;
  position: fixed;
  z-index: 1;
`;

const StyledDropdownPanel = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-shadow: ${() => themeCssVariables.boxShadow.light};
  box-sizing: border-box;
  left: 0;
  margin-top: ${() => themeCssVariables.spacing[1]};
  min-width: 240px;
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 2;
`;

const StyledSearchInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${() => themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: ${() => themeCssVariables.spacing[8]};
  outline: none;
  padding: 0 ${() => themeCssVariables.spacing[2]};
  width: 100%;

  &::placeholder {
    color: ${() => themeCssVariables.font.color.light};
  }
`;

const StyledOptions = styled.div`
  max-height: 240px;
  overflow-y: auto;
  padding: ${() => themeCssVariables.spacing[1]};
`;

const getEmptyStateText = ({
  isSearching,
  searchErrorMessage,
}: {
  isSearching: boolean;
  searchErrorMessage: string | undefined;
}): string => {
  if (isSearching) {
    return 'Searching…';
  }

  if (isNonEmptyString(searchErrorMessage)) {
    return searchErrorMessage;
  }

  return 'No results';
};

type InlineWorkspaceMemberPickerPanelProps = {
  onSelect: (member: WorkspaceMemberOption) => void;
  onClose: () => void;
};

export const InlineWorkspaceMemberPickerPanel = ({
  onSelect,
  onClose,
}: InlineWorkspaceMemberPickerPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { options, isSearching, searchErrorMessage } = useWorkspaceMemberSearch(
    { searchTerm, shouldListWithoutSearchTerm: true },
  );

  return (
    <>
      <StyledBackdrop onClick={onClose} />
      <StyledDropdownPanel>
        <StyledSearchInput
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              onClose();

              return;
            }

            if (event.key === 'Enter') {
              event.preventDefault();

              if (options.length > 0) {
                onSelect(options[0]);
              }
            }
          }}
          placeholder="Search members"
          aria-label="Search workspace members"
          autoFocus
        />
        <StyledOptions role="listbox" aria-label="Workspace members">
          {options.map((member) => (
            <div key={member.id} role="option" aria-selected={false}>
              <MenuItemAvatar
                avatar={{
                  type: 'rounded',
                  size: 'md',
                  placeholder: getMemberDisplayName(member),
                  placeholderColorSeed: member.id,
                }}
                text={getMemberDisplayName(member)}
                contextualText={member.userEmail ?? undefined}
                onClick={() => onSelect(member)}
              />
            </div>
          ))}
          {options.length === 0 && (
            <MenuItem
              disabled
              text={getEmptyStateText({ isSearching, searchErrorMessage })}
            />
          )}
        </StyledOptions>
      </StyledDropdownPanel>
    </>
  );
};
