import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { viewAnyFieldSearchValueComponentState } from '@/views/states/viewAnyFieldSearchValueComponentState';
import { useLingui } from '@lingui/react/macro';

export const ObjectFilterDropdownAnyFieldSearchInput = () => {
  const { t } = useLingui();

  const [viewAnyFieldSearchValue, setViewAnyFieldSearchValue] =
    useRecoilComponentStateV2(viewAnyFieldSearchValueComponentState);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    setViewAnyFieldSearchValue(inputValue);
  };

  return (
    <DropdownMenuSearchInput
      autoFocus
      type="text"
      value={viewAnyFieldSearchValue}
      placeholder={t`Search any field`}
      onChange={handleSearchChange}
    />
  );
};
