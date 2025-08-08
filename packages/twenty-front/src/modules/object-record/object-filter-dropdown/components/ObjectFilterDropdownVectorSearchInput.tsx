import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useVectorSearchFilterActions } from '@/views/hooks/useVectorSearchFilterActions';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';
import { useLingui } from '@lingui/react/macro';
import { useDebouncedCallback } from 'use-debounce';

export const ObjectFilterDropdownVectorSearchInput = () => {
  const { t } = useLingui();

  const [vectorSearchInputValue, setVectorSearchInputValue] =
    useRecoilComponentState(vectorSearchInputComponentState);

  const { applyVectorSearchFilter } = useVectorSearchFilterActions();

  const debouncedApplyVectorSearchFilter = useDebouncedCallback(
    (value: string) => {
      applyVectorSearchFilter(value);
    },
    500,
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setVectorSearchInputValue(inputValue);
    debouncedApplyVectorSearchFilter(inputValue);
  };

  return (
    <DropdownMenuSearchInput
      autoFocus
      type="text"
      value={vectorSearchInputValue}
      placeholder={t`Search`}
      onChange={handleSearchChange}
    />
  );
};
