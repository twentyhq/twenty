import { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';

import {
  JUSTUS_TRUTH_CLAIM_TYPES,
  JUSTUS_TRUTH_DOMAINS,
} from '@/data-validator/constants/JustusTruthDomains.constants';
import { JUSTUS_TRUTH_OBJECT_NAME_SINGULAR } from '@/data-validator/constants/JustusTruthObjectName.constants';
import { type JustusTruthRecord } from '@/data-validator/types/data-validator.types';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

type TruthEditModalProps = {
  truth: JustusTruthRecord;
  onClose: () => void;
  onSaved: () => void;
};

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const StyledModal = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
`;

const StyledTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const StyledLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing(3)};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledSelect = styled.select`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};

  & > * {
    flex: 1;
  }
`;

const StyledActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledButton = styled.button<{ $primary?: boolean }>`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: background 150ms ease;
  border: 1px solid
    ${({ theme, $primary }) =>
      $primary ? theme.color.blue : theme.border.color.medium};
  background: ${({ theme, $primary }) =>
    $primary ? theme.color.blue : theme.background.primary};
  color: ${({ theme, $primary }) =>
    $primary ? '#ffffff' : theme.font.color.primary};

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TruthEditModal = ({
  truth,
  onClose,
  onSaved,
}: TruthEditModalProps) => {
  const [truthText, setTruthText] = useState(truth.truthText);
  const [domain, setDomain] = useState(truth.domain ?? '');
  const [claimType, setClaimType] = useState(truth.claimType ?? '');
  const [saving, setSaving] = useState(false);

  const { updateOneRecord } = useUpdateOneRecord();

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateOneRecord({
        objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
        idToUpdate: truth.id,
        updateOneRecordInput: {
          truthText,
          domain: domain || null,
          claimType: claimType || null,
        },
      });
      onSaved();
    } catch {
      setSaving(false);
    }
  }, [truth.id, truthText, domain, claimType, updateOneRecord, onSaved]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <StyledOverlay onClick={handleOverlayClick}>
      <StyledModal>
        <StyledTitle>Edit Truth</StyledTitle>
        <StyledLabel>
          Truth Text
          <StyledTextarea
            value={truthText}
            onChange={(e) => setTruthText(e.target.value)}
          />
        </StyledLabel>
        <StyledRow>
          <StyledLabel>
            Domain
            <StyledSelect
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="">-- Select --</option>
              {JUSTUS_TRUTH_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </StyledSelect>
          </StyledLabel>
          <StyledLabel>
            Claim Type
            <StyledSelect
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
            >
              <option value="">-- Select --</option>
              {JUSTUS_TRUTH_CLAIM_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </StyledSelect>
          </StyledLabel>
        </StyledRow>
        <StyledActions>
          <StyledButton onClick={onClose}>Cancel</StyledButton>
          <StyledButton $primary onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </StyledButton>
        </StyledActions>
      </StyledModal>
    </StyledOverlay>
  );
};
