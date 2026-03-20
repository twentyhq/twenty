import { CoatApprovalActions } from '@/coat-approval/components/CoatApprovalActions';
import { type CoatContractRecord } from '@/coat-approval/types/coat-approval.types';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type CoatApprovalDetailProps = {
  contract: CoatContractRecord;
};

const StyledDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

const StyledDetailContent = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledContractTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledStatusBadge = styled.span<{ statusColor: string }>`
  background: ${({ statusColor }) => statusColor}20;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ statusColor }) => statusColor};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 4px 10px;
`;

const StyledSection = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const StyledSectionTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
`;

const StyledInfoGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: 160px 1fr;
`;

const StyledInfoLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledInfoValue = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledEmptyText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-style: italic;
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

const formatDate = (dateString: string | null): string => {
  if (!isDefined(dateString)) {
    return 'Unknown';
  }

  try {
    const date = new Date(dateString);

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
};

const formatCurrency = (value: number | null, currency: string | null): string => {
  if (!isDefined(value)) {
    return 'Not available';
  }

  return `${currency ?? 'CHF'} ${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
};

const renderValue = (value: string | number | null) => {
  if (!isDefined(value) || (typeof value === 'string' && value.trim().length === 0)) {
    return <StyledEmptyText>Not available</StyledEmptyText>;
  }

  return String(value);
};

export const CoatApprovalDetail = ({ contract }: CoatApprovalDetailProps) => {
  const statusColor = getStatusColor(contract.status);
  const customerName = [contract.customerFirstName, contract.customerLastName]
    .filter(Boolean)
    .join(' ');

  return (
    <StyledDetailContainer>
      <StyledDetailContent>
        <StyledContractTitle>
          {contract.name || 'Untitled Contract'}
        </StyledContractTitle>

        <StyledSection>
          <StyledStatusBadge statusColor={statusColor}>
            {getStatusLabel(contract.status)}
          </StyledStatusBadge>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Contract Info</StyledSectionTitle>
          <StyledInfoGrid>
            <StyledInfoLabel>Contract ID</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.contractId)}
            </StyledInfoValue>

            <StyledInfoLabel>Contract Type</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.contractType)}
            </StyledInfoValue>

            <StyledInfoLabel>Source</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.source)}
            </StyledInfoValue>

            <StyledInfoLabel>Start Date</StyledInfoLabel>
            <StyledInfoValue>
              {formatDate(contract.startDate)}
            </StyledInfoValue>

            <StyledInfoLabel>End Date</StyledInfoLabel>
            <StyledInfoValue>
              {formatDate(contract.endDate)}
            </StyledInfoValue>

            <StyledInfoLabel>Duration</StyledInfoLabel>
            <StyledInfoValue>
              {isDefined(contract.durationMonths)
                ? `${contract.durationMonths} months`
                : renderValue(null)}
            </StyledInfoValue>

            <StyledInfoLabel>Product</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.program)}
            </StyledInfoValue>

            <StyledInfoLabel>Program ID</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.programId)}
            </StyledInfoValue>

            <StyledInfoLabel>Value</StyledInfoLabel>
            <StyledInfoValue>
              {formatCurrency(contract.valueGrossBase, contract.currencyBase)}
            </StyledInfoValue>

            <StyledInfoLabel>Bexio ID</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.bexioId)}
            </StyledInfoValue>
          </StyledInfoGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Customer Info</StyledSectionTitle>
          <StyledInfoGrid>
            <StyledInfoLabel>Name</StyledInfoLabel>
            <StyledInfoValue>
              {customerName || <StyledEmptyText>Not available</StyledEmptyText>}
            </StyledInfoValue>

            <StyledInfoLabel>Email</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.customerEmail)}
            </StyledInfoValue>
          </StyledInfoGrid>
        </StyledSection>
      </StyledDetailContent>

      <CoatApprovalActions
        contractId={contract.id}
        currentStatus={contract.status}
      />
    </StyledDetailContainer>
  );
};
