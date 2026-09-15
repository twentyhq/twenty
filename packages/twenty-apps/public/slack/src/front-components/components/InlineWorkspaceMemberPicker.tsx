import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { Avatar } from 'twenty-ui/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InlineWorkspaceMemberPickerPanel } from 'src/front-components/components/InlineWorkspaceMemberPickerPanel';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { getMemberDisplayName } from 'src/front-components/utils/get-member-display-name.util';

const StyledContainer = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
`;

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

const StyledChevron = styled.div`
  border-bottom: 1px solid ${() => themeCssVariables.font.color.tertiary};
  border-right: 1px solid ${() => themeCssVariables.font.color.tertiary};
  height: 5px;
  margin-top: -3px;
  transform: rotate(45deg);
  width: 5px;
`;

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
        {isDefined(selectedMember) ? (
          <StyledSelectedValue>
            <Avatar
              placeholder={getMemberDisplayName(selectedMember)}
              placeholderColorSeed={selectedMember.id}
              type="rounded"
              size="sm"
            />
            <StyledValueName>
              <OverflowingTextWithTooltip
                text={getMemberDisplayName(selectedMember)}
              />
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
