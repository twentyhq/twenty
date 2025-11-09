import { useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { enrichmentFieldSelectionState } from '../states/enrichmentFieldSelectionState';
import { useEnrichCompany } from '../hooks/useEnrichCompany';
import { Button, Checkbox } from 'twenty-ui/input';
import { IconX } from 'twenty-ui/display';

const StyledOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.background.overlayPrimary};
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const StyledPanel = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.superHeavy};
  width: 400px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledContent = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  overflow-y: auto;
  flex: 1;
`;

const StyledFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledFieldItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledFieldLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  text-transform: capitalize;
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(6)};
`;

const FIELD_LABELS: Record<string, string> = {
  employees: 'Employees',
  annualRecurringRevenue: 'Annual Recurring Revenue (ARR)',
  address: 'Address',
  linkedinLink: 'LinkedIn URL',
  xLink: 'X/Twitter URL',
  domainName: 'Domain Name',
};

export const EnrichmentFieldSelector = () => {
  const { t } = useLingui();
  const [enrichmentFieldSelection, setEnrichmentFieldSelection] =
    useRecoilState(enrichmentFieldSelectionState);
  const [selectedFields, setSelectedFields] = useState<string[]>(
    enrichmentFieldSelection.availableFields,
  );
  const { enrichCompany, loading } = useEnrichCompany();

  const handleClose = () => {
    setEnrichmentFieldSelection({
      isOpen: false,
      companyId: null,
      companyName: null,
      availableFields: [],
    });
    setSelectedFields([]);
  };

  const handleToggleField = (fieldName: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldName)
        ? prev.filter((f) => f !== fieldName)
        : [...prev, fieldName],
    );
  };

  const handleEnrich = async () => {
    if (
      !enrichmentFieldSelection.companyId ||
      !enrichmentFieldSelection.companyName ||
      selectedFields.length === 0
    ) {
      return;
    }

    await enrichCompany({
      companyId: enrichmentFieldSelection.companyId,
      companyName: enrichmentFieldSelection.companyName,
      fieldsToEnrich: selectedFields,
    });

    handleClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <StyledOverlay
      isOpen={enrichmentFieldSelection.isOpen}
      onClick={handleOverlayClick}
    >
      <StyledPanel>
        <StyledHeader>
          <StyledTitle>{t`Select Fields to Enrich`}</StyledTitle>
          <StyledCloseButton onClick={handleClose}>
            <IconX size={20} />
          </StyledCloseButton>
        </StyledHeader>

        <StyledContent>
          <StyledFieldList>
            {enrichmentFieldSelection.availableFields.map((field) => (
              <StyledFieldItem key={field}>
                <Checkbox
                  checked={selectedFields.includes(field)}
                  onChange={() => handleToggleField(field)}
                />
                <StyledFieldLabel>
                  {FIELD_LABELS[field] || field}
                </StyledFieldLabel>
              </StyledFieldItem>
            ))}
          </StyledFieldList>
        </StyledContent>

        <StyledFooter>
          <Button
            title={t`Cancel`}
            variant="secondary"
            onClick={handleClose}
            fullWidth
          />
          <Button
            title={t`Enrich`}
            variant="primary"
            onClick={handleEnrich}
            disabled={selectedFields.length === 0 || loading === true}
            fullWidth
          />
        </StyledFooter>
      </StyledPanel>
    </StyledOverlay>
  );
};
