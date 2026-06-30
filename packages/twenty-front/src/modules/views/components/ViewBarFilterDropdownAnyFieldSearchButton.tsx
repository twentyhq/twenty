import { ViewBarFilterDropdownAnyFieldSearchButtonMenuItem } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchButtonMenuItem';
import { useOpenAnyFieldSearchFilterFromViewBar } from '@/views/hooks/useOpenAnyFieldSearchFilterFromViewBar';

export const ViewBarFilterDropdownAnyFieldSearchButton = () => {
  const { openAnyFieldSearchFilterFromViewBar } =
    useOpenAnyFieldSearchFilterFromViewBar();

  const handleSearchClick = () => {
    openAnyFieldSearchFilterFromViewBar();
  };

  return (
    <ViewBarFilterDropdownAnyFieldSearchButtonMenuItem
      onClick={handleSearchClick}
    />
  );
};
