import styled from '@emotion/styled';

export const EditableRelationCreateButton = styled.button`
  display: flex;
  align-items: center;
  border: none;
  font-size: ${(props) => props.theme.fontSizeMedium};
  cursor: pointer;
  user-select: none;
  padding-top: ${(props) => props.theme.spacing(1)};
  padding-bottom: ${(props) => props.theme.spacing(1)};
  padding-left: ${(props) => props.theme.spacing(1)};
  font-family: 'Inter';
  border-radius: 4px;
  width: 100%;
  height: 31px;
  background: none;
  gap: ${(props) => props.theme.spacing(2)};
`;
