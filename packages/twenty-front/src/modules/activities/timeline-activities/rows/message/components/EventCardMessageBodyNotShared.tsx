import styled from '@emotion/styled';
import { IconLock } from 'twenty-ui/display';

const StyledEmailBodyNotShareContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};

  height: 80px;
  justify-content: center;

  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
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
`;

export const EventCardMessageBodyNotShared = ({
  sharedByFullName,
}: {
  sharedByFullName: string;
}) => {
  return (
    <StyledEmailBodyNotShareContainer>
      <StyledEmailBodyNotShare>
        <StyledEmailBodyNotSharedIconContainer>
          <IconLock />
        </StyledEmailBodyNotSharedIconContainer>
        <span>Not shared by {sharedByFullName}</span>
      </StyledEmailBodyNotShare>
    </StyledEmailBodyNotShareContainer>
  );
};
