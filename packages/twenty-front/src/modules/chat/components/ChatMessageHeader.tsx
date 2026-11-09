import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[3]};
  min-width: 0;
`;

const StyledTime = styled.span`
  flex-shrink: 0;
`;

type ChatMessageHeaderProps = {
  avatar: ReactNode;
  name: string;
  createdAt?: Date | string;
};

export const ChatMessageHeader = ({
  avatar,
  name,
  createdAt,
}: ChatMessageHeaderProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  return (
    <StyledHeader>
      {avatar}
      <Text
        render={<span />}
        size="sm"
        color="primary"
        weight="medium"
        truncate
      >
        {name}
      </Text>
      {isDefined(createdAt) && (
        <Text render={<StyledTime />} size="sm" color="light">
          {beautifyPastDateRelativeToNow(createdAt, localeCatalog)}
        </Text>
      )}
    </StyledHeader>
  );
};
