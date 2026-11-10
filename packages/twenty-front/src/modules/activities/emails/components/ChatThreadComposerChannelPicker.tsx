import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { LightButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { type ChatThreadComposerChannel } from '@/activities/emails/types/ChatThreadComposerChannel';

const StyledHandle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type ChatThreadComposerChannelPickerProps = {
  channels: ChatThreadComposerChannel[];
  selectedChannelId: string;
  isDisabled?: boolean;
  onChannelChange: (channelId: string) => void;
};

export const ChatThreadComposerChannelPicker = ({
  channels,
  selectedChannelId,
  isDisabled = false,
  onChannelChange,
}: ChatThreadComposerChannelPickerProps) => {
  const { t } = useLingui();
  const selectedChannel = channels.find(({ id }) => id === selectedChannelId);

  return (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger
        render={
          <LightButton
            type="button"
            aria-label={t`Send with`}
            disabled={isDisabled}
            emphasis="subtle"
            size="sm"
            startIcon={selectedChannel?.logo}
            endIcon={<IconChevronDown />}
          >
            {selectedChannel?.name ?? t`Select a channel`}
          </LightButton>
        }
      />
      <Dropdown.Content aria-label={t`Send with`} side="top" align="start">
        {channels.map(({ id, name, handle, logo }) => (
          <Dropdown.OptionItem
            key={id}
            selected={id === selectedChannelId}
            startIcon={logo}
            onSelect={() => onChannelChange(id)}
          >
            {name}
            {isNonEmptyString(handle) && (
              <StyledHandle> · {handle}</StyledHandle>
            )}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
