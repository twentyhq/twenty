import { CoatApprovalActions } from '@/coat-approval/components/CoatApprovalActions';
import { CoatEditableField } from '@/coat-approval/components/CoatEditableField';
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

const StyledWarningBanner = styled.div`
  align-items: center;
  background: #fef3c720;
  border: 1px solid #f59e0b40;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: #92400e;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledExportStatusBadge = styled.span<{ statusColor: string }>`
  background: ${({ statusColor }) => statusColor}20;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ statusColor }) => statusColor};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 4px 10px;
`;

const StyledProductBadge = styled.span<{ badgeColor: string }>`
  background: ${({ badgeColor }) => badgeColor}20;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ badgeColor }) => badgeColor};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-left: ${({ theme }) => theme.spacing(2)};
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

const StyledPaymentTermsText = styled.pre`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.5;
  margin: ${({ theme }) => theme.spacing(2)} 0 0 0;
  max-height: 200px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const StyledTotalRow = styled.div<{ isValid: boolean }>`
  align-items: center;
  background: ${({ isValid }) => (isValid ? '#22c55e15' : '#ef444415')};
  border: 1px solid ${({ isValid }) => (isValid ? '#22c55e40' : '#ef444440')};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isValid }) => (isValid ? '#166534' : '#991b1b')};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

const StyledBadgeRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSpecialAgreementsText = styled.div`
  background: #fef3c720;
  border: 1px solid #f59e0b30;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.5;
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  white-space: pre-wrap;
  word-wrap: break-word;
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

const formatCurrency = (
  value: number | null,
  currency: string | null,
): string => {
  if (!isDefined(value)) {
    return 'Not available';
  }

  return `${currency ?? 'CHF'} ${value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`;
};

const renderValue = (value: string | number | null) => {
  if (
    !isDefined(value) ||
    (typeof value === 'string' && value.trim().length === 0)
  ) {
    return <StyledEmptyText>Not available</StyledEmptyText>;
  }

  return String(value);
};

const hasNonEmptySpecialAgreements = (value: string | null): boolean => {
  if (!isDefined(value)) {
    return false;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 && trimmed !== '.';
};

export const CoatApprovalDetail = ({ contract }: CoatApprovalDetailProps) => {
  const exportStatusColor = getExportStatusColor(contract.coatExportStatus);
  const productBadge = getProductBadge(contract.program);
  const showSpecialAgreementsWarning = hasNonEmptySpecialAgreements(
    contract.specialAgreements,
  );

  return (
    <StyledDetailContainer>
      <StyledDetailContent>
        <StyledContractTitle>
          {contract.name || 'Untitled Contract'}
        </StyledContractTitle>

        {showSpecialAgreementsWarning && (
          <StyledWarningBanner>
            Zusatzvereinbarung vorhanden -- bitte pruefen
          </StyledWarningBanner>
        )}

        <StyledSection>
          <StyledBadgeRow>
            <StyledExportStatusBadge statusColor={exportStatusColor}>
              {getExportStatusLabel(contract.coatExportStatus)}
            </StyledExportStatusBadge>
            <StyledProductBadge badgeColor={productBadge.color}>
              {productBadge.label}
            </StyledProductBadge>
          </StyledBadgeRow>
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
            <StyledInfoValue>{renderValue(contract.source)}</StyledInfoValue>

            <StyledInfoLabel>Status</StyledInfoLabel>
            <StyledInfoValue>{renderValue(contract.status)}</StyledInfoValue>

            <StyledInfoLabel>Start Date</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="startDate"
                value={contract.startDate}
                objectId={contract.id}
                type="date"
              />
            </StyledInfoValue>

            <StyledInfoLabel>End Date</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="endDate"
                value={contract.endDate}
                objectId={contract.id}
                type="date"
              />
            </StyledInfoValue>

            <StyledInfoLabel>Completion Date</StyledInfoLabel>
            <StyledInfoValue>
              {formatDate(contract.completionDate)}
            </StyledInfoValue>

            <StyledInfoLabel>Duration</StyledInfoLabel>
            <StyledInfoValue>
              {isDefined(contract.durationMonths)
                ? `${contract.durationMonths} months`
                : renderValue(null)}
            </StyledInfoValue>

            <StyledInfoLabel>Product</StyledInfoLabel>
            <StyledInfoValue>{renderValue(contract.program)}</StyledInfoValue>

            <StyledInfoLabel>Program ID</StyledInfoLabel>
            <StyledInfoValue>{renderValue(contract.programId)}</StyledInfoValue>

            <StyledInfoLabel>Value</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="valueGrossBase"
                value={contract.valueGrossBase}
                objectId={contract.id}
                type="number"
              />
            </StyledInfoValue>

            <StyledInfoLabel>Closer</StyledInfoLabel>
            <StyledInfoValue>
              {renderValue(contract.closerEmail)}
            </StyledInfoValue>

            <StyledInfoLabel>Bexio ID</StyledInfoLabel>
            <StyledInfoValue>{renderValue(contract.bexioId)}</StyledInfoValue>
          </StyledInfoGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Customer Info</StyledSectionTitle>
          <StyledInfoGrid>
            <StyledInfoLabel>First Name</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerFirstName"
                value={contract.customerFirstName}
                objectId={contract.id}
              />
            </StyledInfoValue>

            <StyledInfoLabel>Last Name</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerLastName"
                value={contract.customerLastName}
                objectId={contract.id}
              />
            </StyledInfoValue>

            <StyledInfoLabel>Email</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerEmail"
                value={contract.customerEmail}
                objectId={contract.id}
              />
            </StyledInfoValue>

            <StyledInfoLabel>Phone</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerPhone"
                value={contract.customerPhone}
                objectId={contract.id}
              />
            </StyledInfoValue>

            <StyledInfoLabel>Gender</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerGender"
                value={contract.customerGender}
                objectId={contract.id}
              />
            </StyledInfoValue>

            <StyledInfoLabel>Birthday</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerBirthday"
                value={contract.customerBirthday}
                objectId={contract.id}
                type="date"
              />
            </StyledInfoValue>

            <StyledInfoLabel>Street</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerStreet"
                value={contract.customerStreet}
                objectId={contract.id}
              />
            </StyledInfoValue>

            <StyledInfoLabel>City</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerCity"
                value={contract.customerCity}
                objectId={contract.id}
              />
            </StyledInfoValue>

            <StyledInfoLabel>Postcode</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerPostcode"
                value={contract.customerPostcode}
                objectId={contract.id}
              />
            </StyledInfoValue>

            <StyledInfoLabel>Country</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="customerCountry"
                value={contract.customerCountry}
                objectId={contract.id}
              />
            </StyledInfoValue>
          </StyledInfoGrid>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Payment Plan</StyledSectionTitle>
          <StyledInfoGrid>
            <StyledInfoLabel>Contract Value</StyledInfoLabel>
            <StyledInfoValue>
              {formatCurrency(contract.valueGrossBase, contract.currencyBase)}
            </StyledInfoValue>
          </StyledInfoGrid>

          <StyledInfoGrid>
            <StyledInfoLabel>Payment Terms</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="paymentTerms"
                value={contract.paymentTerms}
                objectId={contract.id}
              />
            </StyledInfoValue>
          </StyledInfoGrid>

          {isDefined(contract.paymentTerms) &&
          contract.paymentTerms.trim().length > 0 ? (
            <>
              <StyledPaymentTermsText>
                {contract.paymentTerms}
              </StyledPaymentTermsText>
              <StyledTotalRow isValid={true}>
                <span>Total (from contract value)</span>
                <span>
                  {formatCurrency(
                    contract.valueGrossBase,
                    contract.currencyBase,
                  )}
                </span>
              </StyledTotalRow>
            </>
          ) : (
            <StyledPaymentTermsText>
              No payment terms available. Parsed installments will be generated
              by the AI module.
            </StyledPaymentTermsText>
          )}
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>Special Agreements</StyledSectionTitle>
          {showSpecialAgreementsWarning && (
            <StyledSpecialAgreementsText>
              {contract.specialAgreements}
            </StyledSpecialAgreementsText>
          )}
          <StyledInfoGrid>
            <StyledInfoLabel>Edit</StyledInfoLabel>
            <StyledInfoValue>
              <CoatEditableField
                fieldName="specialAgreements"
                value={contract.specialAgreements}
                objectId={contract.id}
              />
            </StyledInfoValue>
          </StyledInfoGrid>
        </StyledSection>
      </StyledDetailContent>

      <CoatApprovalActions
        contractId={contract.id}
        currentExportStatus={contract.coatExportStatus}
      />
    </StyledDetailContainer>
  );
};
