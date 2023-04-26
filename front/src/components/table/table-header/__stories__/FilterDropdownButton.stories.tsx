import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FilterDropdownButton } from '../FilterDropdownButton';
import styled from '@emotion/styled';

const component = {
  title: 'FilterDropdownButton',
  component: FilterDropdownButton,
};

export default component;

const StyleDiv = styled.div`
  height: 200px;
  width: 200px;
`;

export const RegularFilterDropdownButton = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <StyleDiv>
        <FilterDropdownButton />
      </StyleDiv>
    </ThemeProvider>
  );
};
