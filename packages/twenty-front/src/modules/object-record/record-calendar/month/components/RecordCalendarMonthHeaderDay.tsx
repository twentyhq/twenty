import styled from '@emotion/styled';

type RecordCalendarMonthHeaderDayProps = {
  label: string;
};

const StyledLabel = styled.div`
  display: flex;
  width: calc(100% / 7);
  height: 24px;
  padding: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.font.color.light};
  justify-content: flex-end;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const RecordCalendarMonthHeaderDay = ({
  label,
}: RecordCalendarMonthHeaderDayProps) => {
  return <StyledLabel>{label}</StyledLabel>;
};
