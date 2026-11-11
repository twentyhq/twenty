import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { type WorkspaceMemberOption } from 'src/features/chat/front-components/types/workspace-member-option.type';
import { getMemberDisplayName } from 'src/features/chat/front-components/utils/get-member-display-name.util';
import { useWorkspaceMemberSearch } from 'src/features/chat/front-components/hooks/use-workspace-member-search';

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

const StyledOption = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${() => themeCssVariables.background.secondary};
  }
`;

const StyledOptionText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledOptionName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
`;

const StyledOptionMeta = styled.span`
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

type InlineWorkspaceMemberPickerPanelProps = {
  onSelect: (member: WorkspaceMemberOption) => void;
  onClose: () => void;
};

export const InlineWorkspaceMemberPickerPanel = ({
  onSelect,
  onClose,
}: InlineWorkspaceMemberPickerPanelProps) => {
  const { t } = useTranslate();
  const [searchTerm, setSearchTerm] = useState('');
  const { options, isSearching, searchErrorMessage } = useWorkspaceMemberSearch(
    { searchTerm, shouldListWithoutSearchTerm: true },
  );

  const emptyStateText = isSearching
    ? t('Searching…')
    : isNonEmptyString(searchErrorMessage)
      ? searchErrorMessage
      : t('No results');

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
          placeholder={t('Search members')}
          aria-label={t('Search workspace members')}
          autoFocus
        />
        <StyledOptions role="listbox" aria-label={t('Workspace members')}>
          {options.map((member) => (
            <StyledOption
              key={member.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => onSelect(member)}
            >
              <Avatar
                name={getMemberDisplayName(member)}
                colorSeed={member.id}
                size="md"
                shape="circle"
              />
              <StyledOptionText>
                <StyledOptionName>
                  {getMemberDisplayName(member)}
                </StyledOptionName>
                {isNonEmptyString(member.userEmail) && (
                  <StyledOptionMeta>{member.userEmail}</StyledOptionMeta>
                )}
              </StyledOptionText>
            </StyledOption>
          ))}
          {options.length === 0 && (
            <StyledEmptyState>{emptyStateText}</StyledEmptyState>
          )}
        </StyledOptions>
      </StyledDropdownPanel>
    </>
  );
};
