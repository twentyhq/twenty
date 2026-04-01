import { useCoachingFormSubmissions } from '@/coaching/hooks/useCoachingFormSubmissions';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { IconSparkles } from 'twenty-ui/display';

type CoachingAnamneseTabProps = {
  email: string | null;
  wpUserId: string | null;
};

const StyledContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

// -- AI Overview --

const StyledOverviewCard = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-left: 3px solid ${({ theme }) => theme.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledOverviewIcon = styled.div`
  color: ${({ theme }) => theme.color.blue};
  flex-shrink: 0;
  margin-top: 2px;
`;

const StyledOverviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledOverviewTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledOverviewText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.5;
`;

// -- Date Group --

const StyledDateGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledDateHeader = styled.div`
  background: ${({ theme }) => theme.background.tertiary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => `${theme.border.radius.sm} ${theme.border.radius.sm} 0 0`};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};
`;

// -- Table --

const StyledTable = styled.table`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-collapse: collapse;
  border-top: none;
  width: 100%;
`;

const StyledTableHeader = styled.th`
  background: ${({ theme }) => theme.background.tertiary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  text-align: left;
`;

const StyledTableRow = styled.tr`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledTableCell = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  vertical-align: top;
`;

const StyledQuestionCell = styled(StyledTableCell)`
  color: ${({ theme }) => theme.font.color.secondary};
  max-width: 400px;
`;

const StyledEmptyText = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-style: italic;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

type FormRow = {
  question: string;
  answer: string;
};

type DateGroup = {
  date: string;
  rows: FormRow[];
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(dateString);
  }
};

const buildAnamneseInsight = (groups: DateGroup[]): string | null => {
  if (groups.length === 0) return null;

  const parts: string[] = [];

  parts.push(
    `${groups.length} form submission${groups.length > 1 ? 's' : ''} on record`,
  );

  // Count total Q&As
  const totalQA = groups.reduce((sum, g) => sum + g.rows.length, 0);
  parts.push(`${totalQA} questions answered`);

  // Look for pain scale answers to detect trends
  const painScaleAnswers: { date: string; value: number }[] = [];
  for (const group of groups) {
    for (const row of group.rows) {
      const q = row.question.toLowerCase();
      if (
        q.includes('schmerzen') &&
        q.includes('skala') &&
        !isNaN(Number(row.answer))
      ) {
        painScaleAnswers.push({
          date: group.date,
          value: Number(row.answer),
        });
      }
    }
  }

  if (painScaleAnswers.length >= 2) {
    const first = painScaleAnswers[painScaleAnswers.length - 1];
    const last = painScaleAnswers[0];
    if (last.value < first.value) {
      parts.push(
        `Pain level improved from ${first.value} to ${last.value}`,
      );
    } else if (last.value > first.value) {
      parts.push(
        `Pain level increased from ${first.value} to ${last.value}`,
      );
    } else {
      parts.push(`Pain level stable at ${last.value}`);
    }
  }

  // Look for stress answers
  const stressAnswers: { date: string; answer: string }[] = [];
  for (const group of groups) {
    for (const row of group.rows) {
      if (row.question.toLowerCase().includes('stress')) {
        stressAnswers.push({ date: group.date, answer: row.answer });
      }
    }
  }

  if (stressAnswers.length > 0) {
    const latest = stressAnswers[0];
    if (latest.answer.toLowerCase().includes('extrem')) {
      parts.push('High stress reported in latest submission');
    }
  }

  return parts.join('. ') + '.';
};

export const CoachingAnamneseTab = ({
  email,
  wpUserId,
}: CoachingAnamneseTabProps) => {
  const { formSubmissions, loading } = useCoachingFormSubmissions(
    email,
    wpUserId,
  );

  const dateGroups = useMemo((): DateGroup[] => {
    const groups = new Map<string, FormRow[]>();

    for (const submission of formSubmissions) {
      const date = formatDate(submission.submittedAt as string | null);
      if (!date) continue;

      if (!groups.has(date)) {
        groups.set(date, []);
      }

      const responseData = String(submission.responseData ?? '').trim();
      const formTitle = String(submission.formTitle ?? '').trim();

      // Try parsing responseData as JSON array of {question, answer}
      if (responseData.startsWith('[')) {
        try {
          const parsed = JSON.parse(responseData);
          if (Array.isArray(parsed)) {
            for (const entry of parsed) {
              groups.get(date)!.push({
                question: String(entry.question ?? '').trim() || '—',
                answer: String(entry.answer ?? '').trim() || '—',
              });
            }
            continue;
          }
        } catch {
          // not valid JSON, fall through
        }
      }

      // Try parsing as JSON object {key: value}
      if (responseData.startsWith('{')) {
        try {
          const parsed = JSON.parse(responseData);
          if (typeof parsed === 'object' && parsed !== null) {
            for (const [key, value] of Object.entries(parsed)) {
              groups.get(date)!.push({
                question: key,
                answer: String(value ?? '').trim() || '—',
              });
            }
            continue;
          }
        } catch {
          // not valid JSON, fall through
        }
      }

      // Fallback: use formTitle as question, responseData as answer
      groups.get(date)!.push({
        question: formTitle || '—',
        answer: responseData || '—',
      });
    }

    return Array.from(groups.entries()).map(([date, rows]) => ({
      date,
      rows,
    }));
  }, [formSubmissions]);

  if (loading) {
    return <StyledLoadingText>Loading form submissions...</StyledLoadingText>;
  }

  if (formSubmissions.length === 0) {
    return <StyledEmptyText>No form submissions found</StyledEmptyText>;
  }

  const insight = buildAnamneseInsight(dateGroups);

  return (
    <StyledContainer>
      {/* AI Insight */}
      {insight && (
        <StyledOverviewCard>
          <StyledOverviewIcon>
            <IconSparkles size={20} />
          </StyledOverviewIcon>
          <StyledOverviewContent>
            <StyledOverviewTitle>Anamnesebogen Insights</StyledOverviewTitle>
            <StyledOverviewText>{insight}</StyledOverviewText>
          </StyledOverviewContent>
        </StyledOverviewCard>
      )}

      {/* Grouped by date */}
      {dateGroups.map((group) => (
        <StyledDateGroup key={group.date}>
          <StyledDateHeader>{group.date}</StyledDateHeader>
          <StyledTable>
            <thead>
              <tr>
                <StyledTableHeader style={{ width: '50%' }}>
                  Question
                </StyledTableHeader>
                <StyledTableHeader>Answer</StyledTableHeader>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row, index) => (
                <StyledTableRow key={index}>
                  <StyledQuestionCell>{row.question}</StyledQuestionCell>
                  <StyledTableCell>{row.answer}</StyledTableCell>
                </StyledTableRow>
              ))}
            </tbody>
          </StyledTable>
        </StyledDateGroup>
      ))}
    </StyledContainer>
  );
};
