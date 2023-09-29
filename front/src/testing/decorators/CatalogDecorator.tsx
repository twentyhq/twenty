import { ComponentProps, JSX } from 'react';
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

const StyledElementContainer = styled.div<{ width: number }>`
  display: flex;
  ${({ width }) => width && `min-width: ${width}px;`}
`;

const StyledCellContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const emptyDimension = {
  name: '',
  values: [undefined],
  props: () => ({}),
} as CatalogDimension;

export type CatalogDimension<
  ComponentType extends React.ElementType = () => JSX.Element,
> = {
  name: string;
  values: any[];
  props: (value: any) => Partial<ComponentProps<ComponentType>>;
  labels?: (value: any) => string;
};

export type CatalogOptions = {
  elementContainer?: {
    width?: number;
  };
};

export const CatalogDecorator: Decorator = (Story, context) => {
  const {
    catalog: { dimensions, options },
  } = context.parameters;

  const [
    dimension1,
    dimension2 = emptyDimension,
    dimension3 = emptyDimension,
    dimension4 = emptyDimension,
  ] = dimensions as CatalogDimension[];

  return (
    <StyledContainer>
      {dimension4.values.map((value4: any) => (
        <StyledColumnContainer key={value4}>
          <StyledColumnTitle>
            {dimension4.labels?.(value4) ??
              (typeof value4 === 'string' ? value4 : '')}
          </StyledColumnTitle>
          {dimension3.values.map((value3: any) => (
            <StyledRowsContainer key={value3}>
              <StyledRowsTitle>
                {dimension3.labels?.(value3) ??
                  (typeof value3 === 'string' ? value3 : '')}
              </StyledRowsTitle>
              {dimension2.values.map((value2: any) => (
                <StyledRowContainer key={value2}>
                  <StyledRowTitle>
                    {dimension2.labels?.(value2) ??
                      (typeof value2 === 'string' ? value2 : '')}
                  </StyledRowTitle>
                  {dimension1.values.map((value1: any) => (
                    <StyledCellContainer key={value1} id={value1}>
                      <StyledElementTitle>
                        {dimension1.labels?.(value1) ??
                          (typeof value1 === 'string' ? value1 : '')}
                      </StyledElementTitle>
                      <StyledElementContainer
                        width={options?.elementContainer?.width}
                      >
                        <Story
                          args={{
                            ...context.args,
                            ...dimension1.props(value1),
                            ...dimension2.props(value2),
                            ...dimension3.props(value3),
                            ...dimension4.props(value4),
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
