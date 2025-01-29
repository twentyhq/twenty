import styled from '@emotion/styled';
import { Fragment } from 'react/jsx-runtime';

const StyledChip = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(6)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledIconsContainer = styled.div`
  display: flex;
`;

export const CommandMenuContextChip = ({
  Icons,
  text,
}: {
  Icons: React.ReactNode[];
  text?: string;
}) => {
  return (
    <StyledChip>
      <StyledIconsContainer>
        {Icons.map((Icon, index) => (
          <Fragment key={index}>{Icon}</Fragment>
        ))}
      </StyledIconsContainer>
      <span>{text}</span>
    </StyledChip>
  );
};
