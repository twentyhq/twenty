import { useCallback, useRef, useState } from 'react';
import debounce from 'lodash.debounce';

import { DropdownMenu } from '@/ui/dropdown/components/DropdownMenu';
import { DropdownMenuCheckableItem } from '@/ui/dropdown/components/DropdownMenuCheckableItem';
import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearch } from '@/ui/dropdown/components/DropdownMenuSearch';
import { DropdownMenuSeparator } from '@/ui/dropdown/components/DropdownMenuSeparator';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import type { SelectOption } from '../../types';
interface Props {
  onChange: (value: SelectOption | null) => void;
  value?: SelectOption;
  options: readonly SelectOption[];
  placeholder?: string;
  name?: string;
}

export const MatchColumnSelect = ({
  onChange,
  value,
  options: initialOptions,
  placeholder,
  name,
}: Props) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [options, setOptions] = useState(initialOptions);

  const handleSearchFilterChange = useCallback(
    (text: string) => {
      setOptions(
        initialOptions.filter((option) => option.label.includes(text)),
      );
    },
    [initialOptions],
  );

  const debouncedHandleSearchFilter = debounce(handleSearchFilterChange, 100, {
    leading: true,
  });

  function handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchFilter(event.currentTarget.value);
    debouncedHandleSearchFilter(event.currentTarget.value);
  }

  const containerRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      // onSubmit?.();
    },
  });

  return (
    <DropdownMenu ref={containerRef}>
      <DropdownMenuSearch
        value={searchFilter}
        onChange={handleFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {options?.map((option) => (
          <DropdownMenuCheckableItem
            key={option.label}
            checked={false}
            onChange={() => onChange(option)}
          >
            {/** icon */}
            {option.label}
          </DropdownMenuCheckableItem>
        ))}
        {options?.length === 0 && (
          <DropdownMenuItem>No result</DropdownMenuItem>
        )}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
  // return (
  //   <Select<SelectOption, false>
  //     value={value || null}
  //     colorScheme="gray"
  //     onChange={onChange}
  //     placeholder={placeholder}
  //     options={options}
  //     // chakraStyles={styles.select}
  //     menuPosition="fixed"
  //     components={customComponents}
  //     aria-label={name}
  //   />
  // );
};
