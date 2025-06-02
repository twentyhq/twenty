import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useSearchFilterOperations } from '@/views/hooks/useSearchFilterOperations';
import { useSearchInputState } from '@/views/hooks/useSearchInputState';
import { useLingui } from '@lingui/react/macro';
import { useDebouncedCallback } from 'use-debounce';

export const ViewBarFilterDropdownSearchInput = ({
  filterDropdownId,
}: {
  filterDropdownId: string;
}) => {
  const { t } = useLingui();
  const { searchInputValue, setSearchInputValue } =
    useSearchInputState(filterDropdownId);
  const { applySearchFilter } = useSearchFilterOperations();

  const debouncedApplySearchFilter = useDebouncedCallback((value: string) => {
    applySearchFilter(value);
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchInputValue(inputValue);
    debouncedApplySearchFilter(inputValue);
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={searchInputValue}
        placeholder={t`Search`}
        onChange={handleSearchChange}
      />
    </DropdownContent>
  );
};
