import SortOrFilterChip from '../SortOrFilterChip';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { faArrowDown, faPeople } from '@fortawesome/pro-regular-svg-icons';

const component = {
  title: 'SortOrFilterChip',
  component: SortOrFilterChip,
};

export default component;

type OwnProps = {
  removeFunction: () => void;
};

export const RegularFilterChip = ({ removeFunction }: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <SortOrFilterChip
        id="test_sort"
        icon={faPeople}
        labelKey="Account owner"
        labelValue="is Charles"
        onRemove={removeFunction}
      />
    </ThemeProvider>
  );
};

export const RegularSortChip = ({ removeFunction }: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <SortOrFilterChip
        id="test_sort"
        icon={faArrowDown}
        labelValue="Created at"
        onRemove={removeFunction}
      />
    </ThemeProvider>
  );
};
