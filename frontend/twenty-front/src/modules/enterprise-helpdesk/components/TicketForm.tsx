import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { TicketCategory, TicketChannel, TicketPriority } from '../types/ticket.types';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
  max-width: 640px;
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledFieldGroup = styled.div`
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

const StyledTextarea = styled.textarea`
  padding: ${themeCssVariables.spacing[2]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.transparent.lighter};
  min-height: 100px;
  resize: vertical;
`;

const StyledSelect = styled.select`
  padding: ${themeCssVariables.spacing[2]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.transparent.lighter};
`;

const StyledRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
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

const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES: TicketCategory[] = ['billing', 'technical', 'general', 'feature_request', 'bug'];
const CHANNELS: TicketChannel[] = ['email', 'phone', 'chat', 'portal', 'social'];

export const TicketForm = () => {
  useLingui();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [category, setCategory] = useState<TicketCategory>('general');
  const [channel, setChannel] = useState<TicketChannel>('email');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // placeholder for future GraphQL mutation
  };

  return (
    <StyledContainer>
      <StyledTitle>{t`Create Ticket`}</StyledTitle>
      <form onSubmit={handleSubmit}>
        <StyledFieldGroup>
          <StyledLabel>{t`Subject`}</StyledLabel>
          <StyledInput value={subject} onChange={(e) => setSubject(e.target.value)} />
        </StyledFieldGroup>
        <StyledFieldGroup>
          <StyledLabel>{t`Description`}</StyledLabel>
          <StyledTextarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </StyledFieldGroup>
        <StyledRow>
          <StyledFieldGroup>
            <StyledLabel>{t`Priority`}</StyledLabel>
            <StyledSelect value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </StyledSelect>
          </StyledFieldGroup>
          <StyledFieldGroup>
            <StyledLabel>{t`Category`}</StyledLabel>
            <StyledSelect value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </StyledSelect>
          </StyledFieldGroup>
          <StyledFieldGroup>
            <StyledLabel>{t`Channel`}</StyledLabel>
            <StyledSelect value={channel} onChange={(e) => setChannel(e.target.value as TicketChannel)}>
              {CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
            </StyledSelect>
          </StyledFieldGroup>
        </StyledRow>
        <StyledButton type="submit">{t`Submit Ticket`}</StyledButton>
      </form>
    </StyledContainer>
  );
};
