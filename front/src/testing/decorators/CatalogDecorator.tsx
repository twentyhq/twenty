import styled from '@emotion/styled';
import { Decorator } from '@storybook/react';

const StyledColumnTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
`;

const StyledRowsTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
  width: 100px;
`;

const StyledRowTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
  width: 100px;
`;

const StyledElementTitle = styled.span`
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

const StyledColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRowContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledElementContainer = styled.div`
  display: flex;
`;

const StyledCellContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const emptyVariable = {
  name: '',
  values: [undefined],
  props: () => ({}),
};

export const CatalogDecorator: Decorator = (Story, context) => {
  const {
    catalog: { dimensions, options },
  } = context.parameters;
  const [
    variable1,
    variable2 = emptyVariable,
    variable3 = emptyVariable,
    variable4 = emptyVariable,
  ] = dimensions;

  return (
    <StyledContainer>
      {variable4.values.map((value4: string) => (
        <StyledColumnContainer key={value4}>
          {(variable4.labels?.(value4) || value4) && (
            <StyledColumnTitle>
              {variable4.labels?.(value4) || value4}
            </StyledColumnTitle>
          )}
          {variable3.values.map((value3: string) => (
            <StyledRowsContainer key={value3}>
              {(variable3.labels?.(value3) || value3) && (
                <StyledRowsTitle>
                  {variable3.labels?.(value3) || value3}
                </StyledRowsTitle>
              )}
              {variable2.values.map((value2: string) => (
                <StyledRowContainer key={value2}>
                  {(variable2.labels?.(value2) || value2) && (
                    <StyledRowTitle>
                      {variable2.labels?.(value2) || value2}
                    </StyledRowTitle>
                  )}
                  {variable1.values.map((value1: string) => (
                    <StyledCellContainer key={value1} id={value1}>
                      {(variable1.labels?.(value1) || value1) && (
                        <StyledElementTitle>
                          {variable1.labels?.(value1) || value1}
                        </StyledElementTitle>
                      )}

                      <StyledElementContainer
                        {...options?.StyledelementContainer}
                      >
                        <Story
                          args={{
                            ...context.args,
                            ...variable1.props(value1),
                            ...variable2.props(value2),
                            ...variable3.props(value3),
                            ...variable4.props(value4),
                          }}
                        />
                      </StyledElementContainer>
                    </StyledCellContainer>
                  ))}
                </StyledRowContainer>
              ))}
            </StyledRowsContainer>
          ))}
        </StyledColumnContainer>
      ))}
    </StyledContainer>
  );
};
