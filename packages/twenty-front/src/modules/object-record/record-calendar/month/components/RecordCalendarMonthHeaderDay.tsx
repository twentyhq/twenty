import styled from '@emotion/styled';

type RecordCalendarMonthHeaderDayProps = {
  label: string;
};

const StyledLabel = styled.div`
  display: flex;
  width: calc(100% / 7);
  height: 24px;
`;

export const RecordCalendarMonthHeaderDay = ({
  label,
}: RecordCalendarMonthHeaderDayProps) => {
  return <StyledLabel>{label}</StyledLabel>;
};
