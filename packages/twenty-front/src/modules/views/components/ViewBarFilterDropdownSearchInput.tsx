import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useSearchFilter } from '@/views/hooks/useSearchFilter';
import { useLingui } from '@lingui/react/macro';

export const ViewBarFilterDropdownSearchInput = ({
  filterDropdownId,
}: {
  filterDropdownId: string;
}) => {
  const { t } = useLingui();
  const { searchInputValue, setSearchInputValue, applySearchFilter } =
    useSearchFilter(filterDropdownId);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchInputValue(inputValue);
    applySearchFilter(inputValue);
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
