import SortOrFilterChip from '../SortOrFilterChip';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { faArrowDown } from '@fortawesome/pro-regular-svg-icons';

export default {
  title: 'SortOrFilterChip',
  component: SortOrFilterChip,
};

type OwnProps = {
  removeFunction: () => void;
};

export const RegularSortOrFilterChip = ({ removeFunction }: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <SortOrFilterChip
        id="test_sort"
        icon={faArrowDown}
        label="Test sort"
        onRemove={removeFunction}
      />
    </ThemeProvider>
  );
};
