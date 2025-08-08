import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useLingui } from '@lingui/react/macro';

export const ObjectFilterDropdownAnyFieldSearchInput = () => {
  const { t } = useLingui();

  const [anyFieldFilterSearchValue, setAnyFieldFilterSearchValue] =
    useRecoilComponentState(anyFieldFilterValueComponentState);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    setAnyFieldFilterSearchValue(inputValue);
  };

  return (
    <DropdownMenuSearchInput
      autoFocus
      type="text"
      value={anyFieldFilterSearchValue}
      placeholder={t`Search any field`}
      onChange={handleSearchChange}
    />
  );
};
