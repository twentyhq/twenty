import SortOrFilterChip from '../SortOrFilterChip';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FaArrowDown, FaRegUser } from 'react-icons/fa';

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
        icon={<FaRegUser />}
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
        icon={<FaArrowDown />}
        labelValue="Created at"
        onRemove={removeFunction}
      />
    </ThemeProvider>
  );
};
