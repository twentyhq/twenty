import { SelectedSortType, SortType } from '../SortAndFilterBar';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { faArrowDown } from '@fortawesome/pro-regular-svg-icons';
import { SortDropdownButton } from '../SortDropdownButton';

const component = {
  title: 'SortDropdownButton',
  component: SortDropdownButton,
};

export default component;

type OwnProps = {
  setSorts: () => void;
};

const sorts = [] satisfies SelectedSortType[];

const availableSorts = [
  {
    label: 'Email',
    id: 'email',
    icon: faArrowDown,
  },
] satisfies SortType[];

export const RegularSortDropdownButton = ({ setSorts }: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <SortDropdownButton
        sorts={sorts}
        sortsAvailable={availableSorts}
        setSorts={setSorts}
      />
    </ThemeProvider>
  );
};
