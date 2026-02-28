import { styled } from '@linaria/react';

export const LinariaStaticCell = styled.div`
  height: 32px;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  font-size: 13px;
`;

export const LinariaDynamicCell = styled.div<{
  bgColor: string;
  borderColor: string;
  fontColor: string;
  isReadOnly: boolean;
}>`
  height: 32px;
  border-bottom: 1px solid ${({ borderColor }) => borderColor};
  border-right: 1px solid ${({ borderColor }) => borderColor};
  padding: 0 8px;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  font-size: 13px;
  background: ${({ bgColor }) => bgColor};
  color: ${({ fontColor }) => fontColor};
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
`;

export const LinariaOuterWrapper = styled.div<{
  backgroundColor: string;
  borderColor: string;
}>`
  border-bottom: 1px solid ${({ borderColor }) => borderColor};
  border-right: 1px solid ${({ borderColor }) => borderColor};
  padding: 0;
  text-align: left;
  background: ${({ backgroundColor }) => backgroundColor};
`;

export const LinariaBaseContainer = styled.div<{
  fontColorMedium: string;
  bgSecondary: string;
  fontColorSecondary: string;
  isReadOnly: boolean;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  user-select: none;
  position: relative;

  &:hover {
    ${(props) => {
      if (!props.isReadOnly) return '';
      return `
        outline: 1px solid ${props.fontColorMedium};
        background-color: ${props.bgSecondary};
        color: ${props.fontColorSecondary};
      `;
    }}
  }
`;

export const LinariaDisplayOuter = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: 8px;
  width: 100%;
`;

export const LinariaDisplayInner = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
`;
