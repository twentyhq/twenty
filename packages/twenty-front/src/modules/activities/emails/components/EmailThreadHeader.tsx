import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';

import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type EmailThreadHeaderProps = {
  subject: string;
  lastMessageSentAt: string;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
  gap: ${({ theme }) => theme.spacing(6)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.secondary};
`;

const StyledHead = styled.div`
  width: 100%;
`;

const StyledHeading = styled.h2`
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  max-width: 100%;
  color: ${({ theme }) => theme.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledContent = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  width: 100%;
`;

export const EmailThreadHeader = ({
  subject,
  lastMessageSentAt,
}: EmailThreadHeaderProps) => {
  const { localeCatalog } = useRecoilValue(dateLocaleState);
  const lastMessageSentAtFormatted = beautifyPastDateRelativeToNow(
    lastMessageSentAt,
    localeCatalog,
  );

  return (
    <StyledContainer>
      <StyledHead>
        <StyledHeading>{subject}</StyledHeading>
        {lastMessageSentAt && (
          <StyledContent>
            {t`Last message ${lastMessageSentAtFormatted}`}
          </StyledContent>
        )}
      </StyledHead>
    </StyledContainer>
  );
};
