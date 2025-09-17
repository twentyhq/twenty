import styled from '@emotion/styled';

type RecordCalendarMonthHeaderDayProps = {
  label: string;
};

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  height: 24px;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.spacing(0, 1)};
  width: calc(100% / 7);
`;

export const RecordCalendarMonthHeaderDay = ({
  label,
}: RecordCalendarMonthHeaderDayProps) => {
  return <StyledLabel>{label}</StyledLabel>;
};
