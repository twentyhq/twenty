import styled from '@emotion/styled';

const StyledRecordPageWidgetCardContent = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

export { StyledRecordPageWidgetCardContent as RecordPageWidgetCardContent };
