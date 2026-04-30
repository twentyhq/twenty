import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { JournalEntryLine } from '../types/accounting.types';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
  max-width: 720px;
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledInput = styled.input`
  padding: ${themeCssVariables.spacing[2]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.transparent.lighter};
`;

const StyledLineRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: ${themeCssVariables.spacing[2]};
  align-items: center;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledTotals = styled.div<{ isBalanced: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
  background: ${({ isBalanced }) =>
    isBalanced ? themeCssVariables.background.transparent.lighter : 'transparent'};
  border: 1px solid ${({ isBalanced }) =>
    isBalanced ? themeCssVariables.color.turquoise : themeCssVariables.color.red};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${({ isBalanced }) =>
    isBalanced ? themeCssVariables.color.turquoise : themeCssVariables.color.red};
`;

const StyledButton = styled.button`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  border: none;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  cursor: pointer;
  align-self: flex-start;
`;

const StyledAddButton = styled.button`
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  background: transparent;
  color: ${themeCssVariables.color.blue};
  border: 1px dashed ${themeCssVariables.color.blue};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  cursor: pointer;
  align-self: flex-start;
`;

const INITIAL_LINES: JournalEntryLine[] = [
  { accountId: '1100', accountName: 'Cash', debit: 0, credit: 0 },
  { accountId: '4000', accountName: 'Revenue', debit: 0, credit: 0 },
];

export const JournalEntryForm = () => {
  useLingui();
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<JournalEntryLine[]>(INITIAL_LINES);

  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const updateLine = (index: number, field: 'debit' | 'credit', value: number) => {
    setLines((prev) =>
      prev.map((line, idx) => (idx === index ? { ...line, [field]: value } : line)),
    );
  };

  const addLine = () => {
    setLines((prev) => [...prev, { accountId: '', accountName: '', debit: 0, credit: 0 }]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <StyledContainer>
      <StyledTitle>{t`Journal Entry`}</StyledTitle>
      <form onSubmit={handleSubmit}>
        <StyledField>
          <StyledLabel>{t`Description`}</StyledLabel>
          <StyledInput value={description} onChange={(e) => setDescription(e.target.value)} />
        </StyledField>
        <StyledLineRow>
          <StyledLabel>{t`Account`}</StyledLabel>
          <StyledLabel>{t`Debit`}</StyledLabel>
          <StyledLabel>{t`Credit`}</StyledLabel>
        </StyledLineRow>
        {lines.map((line, index) => (
          <StyledLineRow key={index}>
            <StyledInput value={line.accountName} readOnly />
            <StyledInput
              type="number"
              value={line.debit || ''}
              onChange={(e) => updateLine(index, 'debit', Number(e.target.value))}
            />
            <StyledInput
              type="number"
              value={line.credit || ''}
              onChange={(e) => updateLine(index, 'credit', Number(e.target.value))}
            />
          </StyledLineRow>
        ))}
        <StyledAddButton type="button" onClick={addLine}>{t`+ Add Line`}</StyledAddButton>
        <StyledTotals isBalanced={isBalanced}>
          <span>{t`Total Debit`}: {totalDebit.toLocaleString()}</span>
          <span>{t`Total Credit`}: {totalCredit.toLocaleString()}</span>
        </StyledTotals>
        <StyledButton type="submit" disabled={!isBalanced}>{t`Post Entry`}</StyledButton>
      </form>
    </StyledContainer>
  );
};
