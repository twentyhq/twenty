/* eslint-disable lingui/no-unlocalized-strings */
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

type SubscriptionSummaryHeaderProps = {
  recordId: string;
  objectNameSingular: string;
};

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledPill = styled.span<{ textColor: string; bgColor: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 50px;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ textColor }) => textColor};
  background: ${({ bgColor }) => bgColor};
  white-space: nowrap;
`;

const StyledLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-right: 4px;
`;

const StyledDateItem = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.primary};
  white-space: nowrap;
`;

const StyledSeparator = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
  margin: 0 4px;
`;

type TagColor = { text: string; bg: string };

const formatDisplayDate = (value: string | null | undefined): string => {
  if (!isDefined(value)) return 'Not set';
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatPillLabel = (value: string | null | undefined): string => {
  if (!isDefined(value)) return 'Not set';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const SubscriptionSummaryHeader = ({
  recordId,
  objectNameSingular,
}: SubscriptionSummaryHeaderProps) => {
  const theme = useTheme();
  const { record } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
  });

  if (!record) return null;

  const accessColorMap: Record<string, TagColor> = {
    ACTIVE: { text: theme.tag.text.green, bg: theme.tag.background.green },
    PAUSED: { text: theme.tag.text.red, bg: theme.tag.background.red },
    NOT_GRANTED: { text: theme.tag.text.gray, bg: theme.tag.background.gray },
    WITHDRAWN: { text: theme.tag.text.yellow, bg: theme.tag.background.yellow },
    UNCLEAR: { text: theme.tag.text.orange, bg: theme.tag.background.orange },
  };

  const paymentColorMap: Record<string, TagColor> = {
    PAID: { text: theme.tag.text.green, bg: theme.tag.background.green },
    INSTALLMENTS: { text: theme.tag.text.blue, bg: theme.tag.background.blue },
    OVERDUE: { text: theme.tag.text.red, bg: theme.tag.background.red },
    IN_DISPUTE: {
      text: theme.tag.text.orange,
      bg: theme.tag.background.orange,
    },
  };

  const defaultColor: TagColor = {
    text: theme.tag.text.gray,
    bg: theme.tag.background.gray,
  };

  const accessColors =
    accessColorMap[record.accessStatus as string] ?? defaultColor;
  const paymentColors =
    paymentColorMap[record.paymentStatus as string] ?? defaultColor;

  return (
    <StyledContainer>
      <StyledRow>
        <StyledLabel>Access:</StyledLabel>
        <StyledPill textColor={accessColors.text} bgColor={accessColors.bg}>
          {formatPillLabel(record.accessStatus)}
        </StyledPill>
        <StyledLabel>Payment:</StyledLabel>
        <StyledPill textColor={paymentColors.text} bgColor={paymentColors.bg}>
          {formatPillLabel(record.paymentStatus)}
        </StyledPill>
        {isDefined(record.status) && (
          <>
            <StyledLabel>Status:</StyledLabel>
            <StyledPill textColor={defaultColor.text} bgColor={defaultColor.bg}>
              {record.status}
            </StyledPill>
          </>
        )}
      </StyledRow>
      <StyledRow>
        <StyledLabel>Start:</StyledLabel>
        <StyledDateItem>{formatDisplayDate(record.startDate)}</StyledDateItem>
        <StyledSeparator>|</StyledSeparator>
        <StyledLabel>End:</StyledLabel>
        <StyledDateItem>{formatDisplayDate(record.endDate)}</StyledDateItem>
        <StyledSeparator>|</StyledSeparator>
        <StyledLabel>Final:</StyledLabel>
        <StyledDateItem>
          {formatDisplayDate(record.finalEndDate)}
        </StyledDateItem>
        <StyledSeparator>|</StyledSeparator>
        <StyledLabel>Pause Days:</StyledLabel>
        <StyledDateItem>
          {isDefined(record.pauseDays) ? record.pauseDays : 'Not set'}
        </StyledDateItem>
      </StyledRow>
    </StyledContainer>
  );
};
