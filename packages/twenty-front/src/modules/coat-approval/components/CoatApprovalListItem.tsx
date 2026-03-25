import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type CoatApprovalListItemProps = {
  contractName: string;
  customerName: string | null;
  programName: string | null;
  coatExportStatus: string | null;
  signatureDate: string | null;
  hasSpecialAgreements: boolean;
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

const StyledTopRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledContractName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
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

const StyledExportStatusBadge = styled.span<{ statusColor: string }>`
  background: ${({ statusColor }) => statusColor}20;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ statusColor }) => statusColor};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 2px 6px;
`;

const StyledProductBadge = styled.span<{ badgeColor: string }>`
  background: ${({ badgeColor }) => badgeColor}20;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ badgeColor }) => badgeColor};
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 2px 6px;
`;

const StyledWarningIndicator = styled.span`
  color: #f59e0b;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const getExportStatusColor = (status: string | null): string => {
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

const getExportStatusLabel = (status: string | null): string => {
  switch (status) {
    case 'READY_FOR_EXPORT':
      return 'Ready for Export';
    case 'DECLINED':
      return 'Declined';
    case 'NEEDS_APPROVAL':
      return 'Needs Approval';
    default:
      return status ?? 'New';
  }
};

type ProductBadgeInfo = {
  label: string;
  color: string;
};

const getProductBadge = (programName: string | null): ProductBadgeInfo => {
  if (!isDefined(programName)) {
    return { label: 'Unknown', color: '#6b7280' };
  }

  const lower = programName.toLowerCase();

  if (lower.includes('schmerzfrei')) {
    return { label: 'Schmerzfrei', color: '#3b82f6' };
  }

  if (lower.includes('blueprint')) {
    return { label: 'Blueprint', color: '#22c55e' };
  }

  if (lower.includes('ausbildung')) {
    return { label: 'Ausbildung', color: '#8b5cf6' };
  }

  if (lower.includes('fundament')) {
    return { label: 'Fundament', color: '#f97316' };
  }

  return { label: programName, color: '#6b7280' };
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
  coatExportStatus,
  signatureDate,
  hasSpecialAgreements,
  isSelected,
  onClick,
}: CoatApprovalListItemProps) => {
  const formattedDate = formatDate(signatureDate);
  const statusColor = getExportStatusColor(coatExportStatus);
  const productBadge = getProductBadge(programName);

  return (
    <StyledListItem isSelected={isSelected} onClick={onClick}>
      <StyledTopRow>
        <StyledContractName>
          {contractName || 'Untitled Contract'}
        </StyledContractName>
        <StyledProductBadge badgeColor={productBadge.color}>
          {productBadge.label}
        </StyledProductBadge>
      </StyledTopRow>
      <StyledMetaRow>
        {isDefined(customerName) && <span>{customerName}</span>}
      </StyledMetaRow>
      <StyledMetaRow>
        <StyledExportStatusBadge statusColor={statusColor}>
          {getExportStatusLabel(coatExportStatus)}
        </StyledExportStatusBadge>
        {isDefined(formattedDate) && <span>{formattedDate}</span>}
        {hasSpecialAgreements && (
          <StyledWarningIndicator title="Zusatzvereinbarung vorhanden">
            !!
          </StyledWarningIndicator>
        )}
      </StyledMetaRow>
    </StyledListItem>
  );
};
