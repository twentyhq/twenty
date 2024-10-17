import { JSX } from 'react';
import styled from '@emotion/styled';

type HorizontalSeparatorProps = {
  visible?: boolean;
  text?: string;
};
const StyledSeparator = styled.div<HorizontalSeparatorProps>`
  background-color: ${({ theme }) => theme.border.color.medium};
  height: ${({ visible }) => (visible ? '1px' : 0)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledSeparatorContainer = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledLine = styled.div<HorizontalSeparatorProps>`
  background-color: ${({ theme }) => theme.border.color.medium};
  height: ${({ visible }) => (visible ? '1px' : 0)};
  flex-grow: 1;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin: 0 ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

export const HorizontalSeparator = ({
  visible = true,
  text = '',
}: HorizontalSeparatorProps): JSX.Element => (
  <>
    {text ? (
      <StyledSeparatorContainer>
        <StyledLine visible={visible} />
        {text && <StyledText>{text}</StyledText>}
        <StyledLine visible={visible} />
      </StyledSeparatorContainer>
    ) : (
      <StyledSeparator visible={visible} />
    )}
  </>
);
