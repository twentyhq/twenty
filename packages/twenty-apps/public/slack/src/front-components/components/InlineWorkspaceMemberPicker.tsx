import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { Avatar } from 'twenty-ui/data-display';
import { Button } from 'twenty-ui/input';
import { MenuItem, MenuItemAvatar } from 'twenty-ui/navigation';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useWorkspaceMemberSearch } from 'src/front-components/hooks/use-workspace-member-search';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';

const StyledContainer = styled.div`
  min-width: 0;
  position: relative;
`;

const StyledSelectedChip = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  max-width: 100%;
  padding: ${() => themeCssVariables.spacing[1]};

  &:hover:enabled {
    background: ${() => themeCssVariables.background.transparent.light};
  }

  &:disabled {
    cursor: default;
  }
`;

const StyledChipName = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  min-width: 0;
`;

const StyledDropdownPanel = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-shadow: ${() => themeCssVariables.boxShadow.light};
  box-sizing: border-box;
  left: 0;
  margin-top: ${() => themeCssVariables.spacing[1]};
  position: absolute;
  top: 100%;
  width: 240px;
  z-index: 1;
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

type InlineWorkspaceMemberPickerPanelProps = {
  onSelect: (member: WorkspaceMemberOption) => void;
  onClose: () => void;
};

const InlineWorkspaceMemberPickerPanel = ({
  onSelect,
  onClose,
}: InlineWorkspaceMemberPickerPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { options, isSearching } = useWorkspaceMemberSearch(searchTerm);

  return (
    <StyledDropdownPanel onMouseDown={(event) => event.preventDefault()}>
      <StyledSearchInput
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onBlur={onClose}
        placeholder="Search members"
        aria-label="Search workspace members"
        autoFocus
      />
      <StyledOptions>
        {options.map((member) => (
          <MenuItemAvatar
            key={member.id}
            avatar={{
              type: 'rounded',
              size: 'md',
              placeholder: isNonEmptyString(member.name)
                ? member.name
                : (member.userEmail ?? member.id),
              placeholderColorSeed: member.id,
            }}
            text={isNonEmptyString(member.name) ? member.name : member.id}
            contextualText={member.userEmail ?? undefined}
            onClick={() => onSelect(member)}
          />
        ))}
        {options.length === 0 && (
          <MenuItem disabled text={isSearching ? 'Searching…' : 'No results'} />
        )}
      </StyledOptions>
    </StyledDropdownPanel>
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
    ? isNonEmptyString(selectedMember.name)
      ? selectedMember.name
      : (selectedMember.userEmail ?? selectedMember.id)
    : undefined;

  return (
    <StyledContainer>
      {isDefined(selectedMember) && isDefined(selectedName) ? (
        <StyledSelectedChip
          type="button"
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          aria-label="Change the workspace member"
        >
          <Avatar
            placeholder={selectedName}
            placeholderColorSeed={selectedMember.id}
            type="rounded"
            size="sm"
          />
          <StyledChipName>
            <OverflowingTextWithTooltip text={selectedName} />
          </StyledChipName>
        </StyledSelectedChip>
      ) : (
        <Button
          type="button"
          title="Select member"
          size="small"
          variant="secondary"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
        />
      )}
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
