import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type CoatApprovalListItemProps = {
  contractName: string;
  customerName: string | null;
  programName: string | null;
  status: string | null;
  signatureDate: string | null;
  isSelected: boolean;
  onClick: () => void;
};

const StyledListItem = styled.div<{ isSelected: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.tertiary : 'transparent'};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  transition:
    background 0.1s ease,
    border-color 0.1s ease;

  &:hover {
    background: ${({ theme, isSelected }) =>
      isSelected
        ? theme.background.tertiary
        : theme.background.transparent.light};
  }
`;

const StyledContractName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledMetaRow = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledStatusBadge = styled.span<{ statusColor: string }>`
  background: ${({ statusColor }) => statusColor}20;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ statusColor }) => statusColor};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 2px 6px;
`;

const getStatusColor = (status: string | null): string => {
  switch (status) {
    case 'READY_FOR_EXPORT':
      return '#22c55e';
    case 'DECLINED':
      return '#ef4444';
    case 'NEEDS_APPROVAL':
    default:
      return '#f59e0b';
  }
};

const getStatusLabel = (status: string | null): string => {
  switch (status) {
    case 'READY_FOR_EXPORT':
      return 'Ready for Export';
    case 'DECLINED':
      return 'Declined';
    case 'NEEDS_APPROVAL':
      return 'Needs Approval';
    default:
      return status ?? 'Unknown';
  }
};

const formatDate = (dateString: string | null): string | null => {
  if (!isDefined(dateString)) {
    return null;
  }

  try {
    const date = new Date(dateString);

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return null;
  }
};

export const CoatApprovalListItem = ({
  contractName,
  customerName,
  programName,
  status,
  signatureDate,
  isSelected,
  onClick,
}: CoatApprovalListItemProps) => {
  const formattedDate = formatDate(signatureDate);
  const statusColor = getStatusColor(status);

  return (
    <StyledListItem isSelected={isSelected} onClick={onClick}>
      <StyledContractName>
        {contractName || 'Untitled Contract'}
      </StyledContractName>
      <StyledMetaRow>
        {isDefined(customerName) && <span>{customerName}</span>}
        {isDefined(programName) && <span>{programName}</span>}
      </StyledMetaRow>
      <StyledMetaRow>
        <StyledStatusBadge statusColor={statusColor}>
          {getStatusLabel(status)}
        </StyledStatusBadge>
        {isDefined(formattedDate) && <span>{formattedDate}</span>}
      </StyledMetaRow>
    </StyledListItem>
  );
};
