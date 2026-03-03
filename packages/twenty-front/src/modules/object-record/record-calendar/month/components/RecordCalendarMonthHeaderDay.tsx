import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type RecordCalendarMonthHeaderDayProps = {
  label: string;
};

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: 24px;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[1]};
  width: calc(100% / 7);
`;

export const RecordCalendarMonthHeaderDay = ({
  label,
}: RecordCalendarMonthHeaderDayProps) => {
  return <StyledLabel>{label}</StyledLabel>;
};
