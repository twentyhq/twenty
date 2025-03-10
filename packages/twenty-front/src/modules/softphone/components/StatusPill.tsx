/* eslint-disable @nx/workspace-no-hardcoded-colors */
import styled from '@emotion/styled';

const StyledStatusWrapper = styled.div`
  align-items: center;
  background-color: #e5fbe5;
  border-radius: 12px;
  color: #1b5e20;
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
  padding: 2px 5px;
  width: fit-content;
  /* Additional property to ensure responsiveness */
`;

const StyledStatusCircle = styled.div<{ status: string }>`
  background-color: ${({ status }) =>
    status === 'online'
      ? '#1b5e20'
      : status === 'registering'
        ? '#fbc02d'
        : '#d32f2f'};
  border-radius: 50%;
  height: 6px;
  width: 6px;
`;

const StatusIndicator = ({ status }: { status: string }) => {
  return (
    <StyledStatusWrapper>
      <StyledStatusCircle status={status} />
      {status === 'online'
        ? 'Online'
        : status === 'registering'
          ? 'Registrando'
          : 'Offline'}
    </StyledStatusWrapper>
  );
};

export default StatusIndicator;
