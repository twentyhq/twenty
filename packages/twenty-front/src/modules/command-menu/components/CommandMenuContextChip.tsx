import styled from '@emotion/styled';

const StyledChip = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledIconsContainer = styled.div`
  display: flex;
`;

const StyledIconWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(0.5)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  &:not(:first-of-type) {
    margin-left: -${({ theme }) => theme.spacing(1)};
  }
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CommandMenuContextChip = ({
  Icons,
  text,
}: {
  Icons: React.ReactNode[];
  text: string;
}) => {
  return (
    <StyledChip>
      <StyledIconsContainer>
        {Icons.map((Icon, index) => (
          <StyledIconWrapper key={index}>{Icon}</StyledIconWrapper>
        ))}
      </StyledIconsContainer>
      {text}
    </StyledChip>
  );
};
