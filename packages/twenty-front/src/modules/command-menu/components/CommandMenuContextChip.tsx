import styled from '@emotion/styled';

const StyledChip = styled.div<{ variant?: 'default' | 'small' }>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme, variant }) =>
    variant === 'small' ? theme.spacing(6) : theme.spacing(8)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledIconsContainer = styled.div`
  display: flex;
`;

const StyledIconWrapper = styled.div<{ withIconBackground?: boolean }>`
  background: ${({ theme, withIconBackground }) =>
    withIconBackground ? theme.background.primary : 'unset'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(0.5)};
  border: 1px solid
    ${({ theme, withIconBackground }) =>
      withIconBackground ? theme.border.color.medium : 'transparent'};
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
  withIconBackground,
  variant = 'default',
}: {
  Icons: React.ReactNode[];
  text?: string;
  withIconBackground?: boolean;
  variant?: 'default' | 'small';
}) => {
  return (
    <StyledChip variant={variant}>
      <StyledIconsContainer>
        {Icons.map((Icon, index) => (
          <StyledIconWrapper
            key={index}
            withIconBackground={withIconBackground}
          >
            {Icon}
          </StyledIconWrapper>
        ))}
      </StyledIconsContainer>
      <span>{text}</span>
    </StyledChip>
  );
};
