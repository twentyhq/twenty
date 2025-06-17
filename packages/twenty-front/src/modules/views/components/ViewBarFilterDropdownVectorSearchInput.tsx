import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useVectorSearchFilterActions } from '@/views/hooks/useVectorSearchFilterActions';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';
import { useLingui } from '@lingui/react/macro';
import { useDebouncedCallback } from 'use-debounce';

export const ViewBarFilterDropdownVectorSearchInput = ({
  filterDropdownId,
}: {
  filterDropdownId: string;
}) => {
  const { t } = useLingui();
  const [vectorSearchInputValue, setVectorSearchInputValue] =
    useRecoilComponentStateV2(
      vectorSearchInputComponentState,
      filterDropdownId,
    );
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
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={vectorSearchInputValue}
        placeholder={t`Search`}
        onChange={handleSearchChange}
      />
    </DropdownContent>
  );
};
