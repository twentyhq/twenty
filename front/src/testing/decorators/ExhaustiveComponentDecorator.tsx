import styled from '@emotion/styled';
import { Decorator, StrictArgs } from '@storybook/react';

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

const StyledVariantTitle = styled.h1`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
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

const StyledLineContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledComponentContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

function renderSize(
  size: string,
  variants: string[],
  states: string[],
  args: StrictArgs,
  Story: React.FC<StrictArgs>,
) {
  return (
    <StyledSizeContainer key={size}>
      <StyledSizeTitle>{size}</StyledSizeTitle>
      {variants.map((variant) => (
        <div key={variant}>
          <StyledVariantTitle>{variant}</StyledVariantTitle>
          <StyledLineContainer>
            {states.map((state) => (
              <StyledComponentContainer key={`${variant}-container-${state}`}>
                <StyledStateTitle>{state}</StyledStateTitle>
                <Story
                  args={{ ...args, variant: variant, ...stateProps(state) }}
                />
              </StyledComponentContainer>
            ))}
          </StyledLineContainer>
        </div>
      ))}
    </StyledSizeContainer>
  );
}

export const ExhaustiveComponentDecorator: Decorator = (Story, context) => {
  const parameters = context.parameters;
  return (
    <StyledContainer>
      {parameters.sizes.map((size: string) =>
        renderSize(
          size,
          parameters.variants,
          parameters.states,
          context.args,
          Story,
        ),
      )}
    </StyledContainer>
  );
};
