import { CoatApprovalActions } from '@/coat-approval/components/CoatApprovalActions';
import { type CoatContractDetailRecord } from '@/coat-approval/types/coat-approval.types';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type CoatApprovalDetailProps = {
  contract: CoatContractDetailRecord;
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

const StyledLink = styled.a`
  color: ${({ theme }) => theme.color.blue};
  font-size: ${({ theme }) => theme.font.size.sm};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
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

const renderValue = (value: string | null) => {
  if (!isDefined(value) || value.trim().length === 0) {
    return <StyledEmptyText>Not available</StyledEmptyText>;
  }

  return value;
};

export const CoatApprovalDetail = ({ contract }: CoatApprovalDetailProps) => {
  const statusColor = getStatusColor(contract.status);

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

            <StyledInfoLabel>Internal ID</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.internalContractId)}
            </StyledInfoValue>

            <StyledInfoLabel>Signature Date</StyledInfoLabel>
            <StyledInfoValue>
              {formatDate(contract.signatureDate)}
            </StyledInfoValue>

            <StyledInfoLabel>Product</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.programName)}
            </StyledInfoValue>

            <StyledInfoLabel>Payment Agreement</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.paymentAgreement)}
            </StyledInfoValue>

            <StyledInfoLabel>Payment Plan</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.paymentPlan)}
            </StyledInfoValue>

            {isDefined(contract.errorCode) &&
              contract.errorCode.trim().length > 0 && (
                <>
                  <StyledInfoLabel>Error Code</StyledInfoLabel>
                  <StyledInfoValue>{contract.errorCode}</StyledInfoValue>
                </>
              )}

            {isDefined(contract.docusealUrl) &&
              contract.docusealUrl.trim().length > 0 && (
                <>
                  <StyledInfoLabel>DocuSeal</StyledInfoLabel>
                  <StyledInfoValue>
                    <StyledLink
                      href={contract.docusealUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </StyledLink>
                  </StyledInfoValue>
                </>
              )}
          </StyledInfoGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Customer Info</StyledSectionTitle>
          <StyledInfoGrid>
            <StyledInfoLabel>Name</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.customerName)}
            </StyledInfoValue>

            <StyledInfoLabel>Email</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.customerEmail)}
            </StyledInfoValue>

            <StyledInfoLabel>Billing Address</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.billingAddress)}
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
