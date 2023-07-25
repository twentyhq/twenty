import styled from '@emotion/styled';
import { Decorator } from '@storybook/react';

function stateProps(state: string) {
  switch (state) {
    case 'default':
      return {};
    case 'hover':
      return { className: 'hover' };
    case 'active':
      return { className: 'active' };
    case 'disabled':
      return { disabled: true };
    default:
      return {};
  }
}

const StyledSizeTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
`;

const StyledVariantTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
  width: 100px;
`;

const StyledAccentTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
  width: 100px;
`;

const StyledStateTitle = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-align: center;
  text-transform: uppercase;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledSizeContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledVariantContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledAccentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStateContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const ExhaustiveComponentDecorator: Decorator = (Story, context) => {
  const parameters = context.parameters;
  return (
    <StyledContainer>
      {parameters.sizes.map((size: string) => (
        <StyledSizeContainer key={size}>
          <StyledSizeTitle>{size}</StyledSizeTitle>
          {parameters.variants.map((variant: string) => (
            <StyledVariantContainer key={variant}>
              <StyledVariantTitle>{variant}</StyledVariantTitle>
              {parameters.accents.map((accent: string) => (
                <StyledAccentContainer key={accent}>
                  <StyledAccentTitle>{accent}</StyledAccentTitle>
                  {parameters.states.map((state: string) => (
                    <StyledStateContainer key={state}>
                      <StyledStateTitle>{state}</StyledStateTitle>
                      <Story
                        args={{
                          ...context.args,
                          accent: accent,
                          variant: variant,
                          ...stateProps(state),
                        }}
                      />
                    </StyledStateContainer>
                  ))}
                </StyledAccentContainer>
              ))}
            </StyledVariantContainer>
          ))}
        </StyledSizeContainer>
      ))}
    </StyledContainer>
  );
};
