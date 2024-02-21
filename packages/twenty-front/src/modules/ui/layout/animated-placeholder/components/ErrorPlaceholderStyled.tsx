import styled from '@emotion/styled';

const StyledErrorContainer = styled.div`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  justify-content: center;
  text-align: center;
`;

export { StyledErrorContainer as AnimatedPlaceholderErrorContainer };

const StyledErrorTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export { StyledErrorTextContainer as AnimatedPlaceholderErrorTextContainer };

const StyledErrorTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

export { StyledErrorTitle as AnimatedPlaceholderErrorTitle };

const StyledErrorSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  max-height: 2.4em;
  overflow: hidden;
`;

export { StyledErrorSubTitle as AnimatedPlaceholderErrorSubTitle };
