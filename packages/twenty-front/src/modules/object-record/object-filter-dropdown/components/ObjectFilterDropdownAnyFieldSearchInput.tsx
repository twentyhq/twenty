import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useLingui } from '@lingui/react/macro';

export const ObjectFilterDropdownAnyFieldSearchInput = () => {
  const { t } = useLingui();

  const [anyFieldFilterSearchValue, setAnyFieldFilterSearchValue] =
    useRecoilComponentStateV2(anyFieldFilterValueComponentState);

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
