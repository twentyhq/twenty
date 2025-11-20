import styled from '@emotion/styled';

const StyledDashboardWidgetCardContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export { StyledDashboardWidgetCardContent as DashboardWidgetCardContent };
