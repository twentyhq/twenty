import styled from '@emotion/styled';

export const CellNormalModeContainer = styled.div`
  display: flex;
  align-items: center;
  width: calc(100% - ${(props) => props.theme.spacing(5)});
  height: 100%;
  overflow: hidden;

  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
`;
