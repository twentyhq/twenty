/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { statusEnum } from '@/chat/types/WhatsappDocument';
import { formatStatusLabel } from '@/chat/utils/formatStatusLabel';
import styled from '@emotion/styled';

interface ServiceStatusPillProps {
  status: statusEnum;
}

interface SelectServiceStatusProps {
  currentStatus: statusEnum;
  onStatusChange: (newStatus: statusEnum) => void;
  onClose: () => void;
}

interface BgColorProps {
  selected: boolean;
}

const StyledStatusPill = styled.div<ServiceStatusPillProps>`
  background-color: ${({ status }) => {
    switch (status) {
      case 'Resolved':
        return '#DDFCD8';
      case 'InProgress':
        return '#FFF6D7';
      case 'Waiting':
        return '#D1DFFB';
      case 'OnHold':
        return '#E9DFFF';
      case 'Pending':
        return '#FED8D8';
      default:
        return 'gray';
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ status }) => {
    switch (status) {
      case 'Resolved':
        return '#2A5822';
      case 'InProgress':
        return '#746224';
      case 'Waiting':
        return '#18356D';
      case 'OnHold':
        return '#483473';
      case 'Pending':
        return '#712727';
      default:
        return 'gray';
    }
  }};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding-block: ${({ theme }) => theme.spacing(0.5)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: fit-content;
`;

const StyledTextPill = styled.p<ServiceStatusPillProps>`
  display: flex;
  margin: 0;
  padding: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    align-self: center;
    background-color: ${({ status }) => {
      switch (status) {
        case 'Resolved':
          return '#2A5822';
        case 'InProgress':
          return '#746224';
        case 'Waiting':
          return '#18356D';
        case 'OnHold':
          return '#483473';
        case 'Pending':
          return '#712727';
        default:
          return 'gray';
      }
    }};
    border-radius: 50%;
    margin-right: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledBackgroundColor = styled.div<BgColorProps>`
  background-color: ${({ selected }) =>
    selected ? 'rgba(0, 0, 0, 0.04)' : 'transparent'};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  transition: background-color 0.2s;
`;

const StyledMainContainer = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  left: 40px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: 270px;
  width: 130px;
  z-index: 1;
`;

export const SelectServiceStatus = ({
  currentStatus,
  onStatusChange,
  onClose,
}: SelectServiceStatusProps) => {
  const statuses = Object.values(statusEnum).filter(
    (status) => status !== statusEnum.Waiting && status !== statusEnum.Pending,
  );

  return (
    <StyledMainContainer>
      {statuses.map((status) => (
        <StyledBackgroundColor
          key={status}
          onClick={() => {
            onStatusChange(status);
            onClose();
          }}
          selected={currentStatus === status}
        >
          <StyledStatusPill status={status}>
            <StyledTextPill status={status}>
              {formatStatusLabel(status)}
            </StyledTextPill>
          </StyledStatusPill>
        </StyledBackgroundColor>
      ))}
    </StyledMainContainer>
  );
};
