import { styled } from '@linaria/react';

import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables } from 'twenty-ui/theme';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

type ChatMessageTimestampProps = {
  createdAt: Date | string;
};

export const ChatMessageTimestamp = ({
  createdAt,
}: ChatMessageTimestampProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  return (
    <StyledTimestamp>
      {beautifyPastDateRelativeToNow(createdAt, localeCatalog)}
    </StyledTimestamp>
  );
};
