import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-sdk/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/components';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InlineWorkspaceMemberPickerPanel } from 'src/front-components/components/InlineWorkspaceMemberPickerPanel';
import { SlackDropdownTrigger } from 'src/front-components/components/SlackDropdownTrigger';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { getMemberDisplayName } from 'src/front-components/utils/get-member-display-name.util';

const StyledContainer = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
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
      <SlackDropdownTrigger
        ariaLabel="Select the workspace member"
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        disabled={disabled}
        size="small"
      >
        {isDefined(selectedMember) ? (
          <StyledSelectedValue>
            <Avatar
              name={getMemberDisplayName(selectedMember)}
              colorSeed={selectedMember.id}
              shape="circle"
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
      </SlackDropdownTrigger>
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
