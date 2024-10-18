import styled from '@emotion/styled';

const StyledEditorContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.border.radius.sm}
    ${({ theme }) => theme.border.radius.sm};
`;

export const SettingsServerlessFunctionCodeEditorContainer =
  StyledEditorContainer;
