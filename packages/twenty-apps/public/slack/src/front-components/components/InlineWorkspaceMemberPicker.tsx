import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { Avatar } from 'twenty-ui/data-display';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useWorkspaceMemberSearch } from 'src/front-components/hooks/use-workspace-member-search';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { getMemberDisplayName } from 'src/front-components/utils/get-member-display-name.util';

const StyledContainer = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`;

// Mirrors twenty-front's SelectControl look; apps cannot import it from the
// front package.
const StyledSelectTrigger = styled.button`
  align-items: center;
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  cursor: pointer;
  display: grid;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  gap: ${() => themeCssVariables.spacing[1]};
  grid-template-columns: 1fr auto;
  height: ${() => themeCssVariables.spacing[6]};
  padding: 0 ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover:enabled {
    background-color: ${() => themeCssVariables.background.transparent.light};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const StyledSelectedValue = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledValueName = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  min-width: 0;
`;

const StyledPlaceholder = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// A CSS chevron: icon components do not size reliably in the
// front-component runtime.
const StyledChevron = styled.div`
  border-bottom: 1px solid ${() => themeCssVariables.font.color.tertiary};
  border-right: 1px solid ${() => themeCssVariables.font.color.tertiary};
  height: 5px;
  margin-top: -3px;
  transform: rotate(45deg);
  width: 5px;
`;

// Blur never fires in the front-component runtime because autofocus does not
// reach the search input, so an invisible backdrop catches outside clicks.
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

const InlineWorkspaceMemberPickerPanel = ({
  onSelect,
  onClose,
}: InlineWorkspaceMemberPickerPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { options, isSearching, searchErrorMessage } =
    useWorkspaceMemberSearch(searchTerm);

  return (
    <>
      <StyledBackdrop onClick={onClose} />
      <StyledDropdownPanel onMouseDown={(event) => event.preventDefault()}>
        <StyledSearchInput
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          onBlur={onClose}
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
          // React consumes autoFocus by calling focus(), which does not exist
          // in the worker DOM; the raw attribute crosses to the host input,
          // which the browser focuses on insertion.
          ref={(node) => node?.setAttribute('autofocus', 'true')}
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

type InlineWorkspaceMemberPickerProps = {
  selectedMember: WorkspaceMemberOption | null;
  onSelect: (member: WorkspaceMemberOption) => void;
  disabled?: boolean;
};

export const InlineWorkspaceMemberPicker = ({
  selectedMember,
  onSelect,
  disabled,
}: InlineWorkspaceMemberPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedName = isDefined(selectedMember)
    ? getMemberDisplayName(selectedMember)
    : undefined;

  return (
    <StyledContainer>
      <StyledSelectTrigger
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        aria-label="Select the workspace member"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {isDefined(selectedMember) && isDefined(selectedName) ? (
          <StyledSelectedValue>
            <Avatar
              placeholder={selectedName}
              placeholderColorSeed={selectedMember.id}
              type="rounded"
              size="sm"
            />
            <StyledValueName>
              <OverflowingTextWithTooltip text={selectedName} />
            </StyledValueName>
          </StyledSelectedValue>
        ) : (
          <StyledPlaceholder>Select member</StyledPlaceholder>
        )}
        <StyledChevron />
      </StyledSelectTrigger>
      {isOpen && (
        <InlineWorkspaceMemberPickerPanel
          onSelect={(member) => {
            setIsOpen(false);
            onSelect(member);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </StyledContainer>
  );
};
