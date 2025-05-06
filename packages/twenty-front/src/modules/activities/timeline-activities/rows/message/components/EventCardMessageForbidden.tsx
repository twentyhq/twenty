import { EventCardMessageBodyNotShared } from '@/activities/timeline-activities/rows/message/components/EventCardMessageBodyNotShared';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
const StyledEventCardMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledEmailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: 100%;
`;

const StyledEmailTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const EventCardMessageForbidden = ({
  notSharedByFullName,
}: {
  notSharedByFullName: string;
}) => {
  return (
    <StyledEventCardMessageContainer>
      <StyledEmailContent>
        <StyledEmailTitle>
          <Trans>Subject not shared</Trans>
        </StyledEmailTitle>
        <EventCardMessageBodyNotShared
          notSharedByFullName={notSharedByFullName}
        />
      </StyledEmailContent>
    </StyledEventCardMessageContainer>
  );
};
