import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { IconLock } from 'twenty-ui/display';

const StyledEmailBodyNotSharedContainer = styled.div`
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
  width: ${({ theme }) => theme.icon.size.sm}px;
  height: ${({ theme }) => theme.icon.size.sm}px;
  justify-content: center;
  align-items: center;
`;

const StyledEmailBodyNotShared = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const EventCardMessageBodyNotShared = ({
  notSharedByFullName,
}: {
  notSharedByFullName: string;
}) => {
  return (
    <StyledEmailBodyNotSharedContainer>
      <StyledEmailBodyNotShared>
        <StyledEmailBodyNotSharedIconContainer>
          <IconLock />
        </StyledEmailBodyNotSharedIconContainer>
        <span>
          <Trans>Not shared by {notSharedByFullName}</Trans>
        </span>
      </StyledEmailBodyNotShared>
    </StyledEmailBodyNotSharedContainer>
  );
};
