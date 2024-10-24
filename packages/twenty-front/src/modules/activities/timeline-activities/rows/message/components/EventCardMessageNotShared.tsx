import styled from '@emotion/styled';
import { IconLock } from 'twenty-ui';

const StyledEventCardMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
`;

const StyledEmailTop = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmailTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
`;

const StyledEmailBodyNotShareContainer = styled.div`
  align-items: center;
  align-self: stretch;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};

  height: 80px;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing(1)};

  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledEmailBodyNotSharedIconContainer = styled.div`
  display: flex;
  width: 14px;
  height: 14px;
  justify-content: center;
  align-items: center;
`;

const StyledEmailBodyNotShare = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

export const EventCardMessageNotShared = ({
  sharedByFullName,
}: {
  sharedByFullName: string;
}) => {
  return (
    <StyledEventCardMessageContainer>
      <StyledEmailContent>
        <StyledEmailTop>
          <StyledEmailTitle>
            <span>Subject not shared</span>
          </StyledEmailTitle>
        </StyledEmailTop>
        <StyledEmailBodyNotShareContainer>
          <StyledEmailBodyNotShare>
            <StyledEmailBodyNotSharedIconContainer>
              <IconLock />
            </StyledEmailBodyNotSharedIconContainer>
            <span>Not shared by {sharedByFullName}</span>
          </StyledEmailBodyNotShare>
        </StyledEmailBodyNotShareContainer>
      </StyledEmailContent>
    </StyledEventCardMessageContainer>
  );
};
