import { useCoachingFormSubmissions } from '@/coaching/hooks/useCoachingFormSubmissions';
import styled from '@emotion/styled';

type CoachingAnamneseTabProps = {
  email: string | null;
  wpUserId: string | null;
};

const StyledContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const StyledTableHeader = styled.th`
  background: ${({ theme }) => theme.background.tertiary};
  border-bottom: 2px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  text-align: left;
`;

const StyledTableRow = styled.tr<{ isHighlighted?: boolean }>`
  background: ${({ isHighlighted, theme }) =>
    isHighlighted ? theme.background.transparent.light : 'transparent'};

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

type FormEntry = {
  question: string;
  answer: string;
};

const parseResponseData = (
  responseData: string | null | undefined,
): FormEntry[] => {
  if (!responseData) return [];
  try {
    const parsed = JSON.parse(responseData as string);
    if (Array.isArray(parsed)) {
      return parsed.map((entry: { question?: string; answer?: string }) => ({
        question: entry.question || '',
        answer: entry.answer || '',
      }));
    }
    if (typeof parsed === 'object') {
      return Object.entries(parsed).map(([key, value]) => ({
        question: key,
        answer: String(value),
      }));
    }
  } catch {
    // not JSON
  }
  return [];
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
    return dateString;
  }
};

export const CoachingAnamneseTab = ({
  email,
  wpUserId,
}: CoachingAnamneseTabProps) => {
  const { formSubmissions, loading } = useCoachingFormSubmissions(
    email,
    wpUserId,
  );

  if (loading) {
    return <StyledLoadingText>Loading form submissions...</StyledLoadingText>;
  }

  if (formSubmissions.length === 0) {
    return <StyledEmptyText>No form submissions found</StyledEmptyText>;
  }

  // Flatten all form submissions into question/answer rows
  const rows: { date: string; question: string; answer: string }[] = [];
  for (const submission of formSubmissions) {
    const date = formatDate(submission.submittedAt as string | null);
    const entries = parseResponseData(
      submission.responseData as string | null,
    );
    for (const entry of entries) {
      rows.push({ date, question: entry.question, answer: entry.answer });
    }
  }

  return (
    <StyledContainer>
      <StyledTable>
        <thead>
          <tr>
            <StyledTableHeader>Submission Date</StyledTableHeader>
            <StyledTableHeader>Question</StyledTableHeader>
            <StyledTableHeader>Answer</StyledTableHeader>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <StyledTableRow key={index} isHighlighted={index === 0}>
              <StyledTableCell>{row.date}</StyledTableCell>
              <StyledTableCell>{row.question}</StyledTableCell>
              <StyledTableCell>{row.answer}</StyledTableCell>
            </StyledTableRow>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
