import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { formatDisplayList } from '~/utils/format/formatDisplayList';

const StyledIndicator = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['1.5']};
  min-width: 0;
`;

const StyledAvatars = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
`;

type AiChatTypingIndicatorProps = {
  participants: {
    id: string;
    name: string;
    avatarUrl?: string;
  }[];
};

export const AiChatTypingIndicator = ({
  participants,
}: AiChatTypingIndicatorProps) => {
  const { t } = useLingui();

  if (!isNonEmptyArray(participants)) {
    return null;
  }

  const participantNames = formatDisplayList(
    participants.map(({ name }) => name),
  );
  const label =
    participants.length === 1
      ? t`${participantNames} is typing…`
      : t`${participantNames} are typing…`;

  return (
    <StyledIndicator role="status" aria-live="polite" aria-atomic>
      <StyledAvatars aria-hidden>
        {participants.map(({ id, name, avatarUrl }) => (
          <Avatar
            key={id}
            colorSeed={id}
            name={name}
            src={avatarUrl}
            size="sm"
            shape="circle"
          />
        ))}
      </StyledAvatars>
      <Text size="sm" color="tertiary" truncate>
        {label}
      </Text>
    </StyledIndicator>
  );
};
