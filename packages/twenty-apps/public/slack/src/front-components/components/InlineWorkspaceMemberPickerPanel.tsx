import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackDropdownBackdrop } from 'src/front-components/components/SlackDropdownBackdrop';
import { SlackPickerDropdownPanel } from 'src/front-components/components/SlackPickerDropdownPanel';
import { useWorkspaceMemberSearch } from 'src/front-components/hooks/use-workspace-member-search';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { getMemberDisplayName } from 'src/front-components/utils/get-member-display-name.util';

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
      <SlackDropdownBackdrop onClose={onClose} />
      <SlackPickerDropdownPanel
        options={options.map((member) => {
          const displayedName = getMemberDisplayName(member);

          return {
            key: member.id,
            name: displayedName,
            meta: member.userEmail ?? undefined,
            avatar: {
              type: 'rounded' as const,
              placeholder: displayedName,
              placeholderColorSeed: member.id,
            },
          };
        })}
        isSearching={isSearching}
        emptyText={
          isNonEmptyString(searchErrorMessage)
            ? searchErrorMessage
            : 'No results'
        }
        listLabel="Workspace members"
        onSelect={(memberId) => {
          const selectedMember = options.find(
            (member) => member.id === memberId,
          );

          if (isDefined(selectedMember)) {
            onSelect(selectedMember);
          }
        }}
        header={
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
        }
      />
    </>
  );
};
