import styled from '@emotion/styled';

export const EditableRelationCreateButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  font-family: 'Inter';
  font-size: ${(props) => props.theme.fontSizeMedium};
  gap: ${(props) => props.theme.spacing(2)};
  height: 31px;
  padding-bottom: ${(props) => props.theme.spacing(1)};
  padding-left: ${(props) => props.theme.spacing(1)};
  padding-top: ${(props) => props.theme.spacing(1)};
  user-select: none;
  width: 100%;
`;
