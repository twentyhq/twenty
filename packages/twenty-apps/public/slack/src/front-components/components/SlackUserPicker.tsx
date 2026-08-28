import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';
import { useSlackUserSearch } from 'src/front-components/hooks/use-slack-user-search';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
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

type SlackUserPickerProps = {
  onSelect: (slackUser: SlackResolvedUser) => void;
  disabled?: boolean;
};

export const SlackUserPicker = ({
  onSelect,
  disabled,
}: SlackUserPickerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { options, isSearching } = useSlackUserSearch(searchTerm);

  const hasSearchTerm = isNonEmptyString(searchTerm.trim());
  const isDropdownOpen = isFocused && hasSearchTerm;

  const handleSelect = (slackUser: SlackResolvedUser) => {
    setSearchTerm('');
    onSelect(slackUser);
  };

  return (
    <StyledContainer>
      <SlackUserLinkTextInput
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search Slack by name or email"
        disabled={disabled}
        aria-label="Search Slack by name or email"
      />
      {isDropdownOpen && (
        <StyledDropdown>
          {options.map((slackUser) => (
            <StyledOption
              key={slackUser.slackUserId}
              type="button"
              // Select on mousedown: the input's blur fires before a click
              // would, closing the dropdown and unmounting this option, so
              // onClick never runs in the front-component sandbox.
              // preventDefault keeps focus.
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelect(slackUser);
              }}
            >
              <StyledOptionName>
                {slackUser.displayName ?? slackUser.slackUserId}
              </StyledOptionName>
              {isNonEmptyString(slackUser.email) && (
                <StyledOptionEmail>{slackUser.email}</StyledOptionEmail>
              )}
            </StyledOption>
          ))}
          {options.length === 0 && (
            <StyledEmptyState>
              {isSearching
                ? 'Searching…'
                : 'No Slack users found. For a guest or Slack Connect user, link by Slack ID below.'}
            </StyledEmptyState>
          )}
        </StyledDropdown>
      )}
    </StyledContainer>
  );
};
