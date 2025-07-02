import { TransferChatOptionsDropdownContent } from '@/chat/call-center/components/TransferChatOptionsDropdownContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  padding: 5px;
  width: 24px;
  min-width: 24px;
`;

const StyledDropdown = styled(Dropdown)`
  width: 200px;
`;

export const TRANSFER_CHAT_OPTIONS_DROPDOWN_ID =
  'transfer-chat-options-dropdown-id';

export const TransferChatOptionsDropdown = () => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const IconArrowForwardUp = getIcon('IconArrowForwardUp');

  return (
    <StyledDropdown
      dropdownId={TRANSFER_CHAT_OPTIONS_DROPDOWN_ID}
      clickableComponent={
        <StyledIconButton
          variant="primary"
          accent="blue"
          size="medium"
          Icon={(props) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <IconArrowForwardUp {...props} color={theme.font.color.inverted} />
          )}
        />
      }
      dropdownPlacement="bottom-start"
      dropdownComponents={<TransferChatOptionsDropdownContent />}
    />
  );
};
