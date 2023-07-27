import styled from '@emotion/styled';
import { Decorator } from '@storybook/react';

const ColumnTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
`;

const RowsTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
  width: 100px;
`;

const RowTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: ${({ theme }) => theme.spacing(2)};
  width: 100px;
`;

export const ElementTitle = styled.span`
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

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const RowsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const RowContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ElementContainer = styled.div`
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
  const { catalog } = context.parameters;
  const [
    variable1,
    variable2 = emptyVariable,
    variable3 = emptyVariable,
    variable4 = emptyVariable,
  ] = catalog;

  return (
    <StyledContainer>
      {variable4.values.map((value4: string) => (
        <ColumnContainer key={value4}>
          {(variable4.labels?.(value4) || value4) && (
            <ColumnTitle>{variable4.labels?.(value4) || value4}</ColumnTitle>
          )}
          {variable3.values.map((value3: string) => (
            <RowsContainer key={value3}>
              {(variable3.labels?.(value3) || value3) && (
                <RowsTitle>{variable3.labels?.(value3) || value3}</RowsTitle>
              )}
              {variable2.values.map((value2: string) => (
                <RowContainer key={value2}>
                  {(variable2.labels?.(value2) || value2) && (
                    <RowTitle>{variable2.labels?.(value2) || value2}</RowTitle>
                  )}
                  {variable1.values.map((value1: string) => (
                    <ElementContainer key={value1} id={value1}>
                      {(variable1.labels?.(value1) || value1) && (
                        <ElementTitle>
                          {variable1.labels?.(value1) || value1}
                        </ElementTitle>
                      )}
                      <Story
                        args={{
                          ...context.args,
                          ...variable1.props(value1),
                          ...variable2.props(value2),
                          ...variable3.props(value3),
                          ...variable4.props(value4),
                        }}
                      />
                    </ElementContainer>
                  ))}
                </RowContainer>
              ))}
            </RowsContainer>
          ))}
        </ColumnContainer>
      ))}
    </StyledContainer>
  );
};
