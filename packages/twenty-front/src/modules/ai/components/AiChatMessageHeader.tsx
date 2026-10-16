import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTime = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
`;

type AiChatMessageHeaderProps = {
  avatar: ReactNode;
  name: string;
  createdAt: Date | string;
};

export const AiChatMessageHeader = ({
  avatar,
  name,
  createdAt,
}: AiChatMessageHeaderProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  return (
    <StyledHeader>
      {avatar}
      <StyledName>{name}</StyledName>
      <StyledTime>
        {beautifyPastDateRelativeToNow(createdAt, localeCatalog)}
      </StyledTime>
    </StyledHeader>
  );
};
