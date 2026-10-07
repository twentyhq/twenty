import { t } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconUserCircle } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Field } from 'twenty-ui/primitives/input';

import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type FormWorkspaceMemberFilterValueInputDropdownContentProps = {
  searchFilter: string;
  onSearchChange: (value: string) => void;
  isCurrentWorkspaceMemberSelected: boolean;
  recordsToSelect: SelectableItem[];
  filteredSelectedRecords: SelectableItem[];
  loading: boolean;
  onSelectChange: (selection: {
    itemToSelect: Pick<SelectableItem, 'id'>;
    isNewSelectedValue: boolean;
  }) => void;
};

export const FormWorkspaceMemberFilterValueInputDropdownContent = ({
  searchFilter,
  onSearchChange,
  isCurrentWorkspaceMemberSelected,
  recordsToSelect,
  filteredSelectedRecords,
  loading,
  onSelectChange,
}: FormWorkspaceMemberFilterValueInputDropdownContentProps) => {
  const isMeVisible = normalizeSearchText(t`Me`).includes(
    normalizeSearchText(searchFilter),
  );
  const items = [...filteredSelectedRecords, ...recordsToSelect];
  const hasNoResults = !loading && !isMeVisible && !isNonEmptyArray(items);

  return (
    <>
      <Field.Root>
        <Dropdown.Search
          value={searchFilter}
          onValueChange={onSearchChange}
          placeholder={t`Search`}
          aria-label={t`Search workspace members`}
        />
      </Field.Root>
      {isMeVisible && (
        <Dropdown.Section>
          <Dropdown.OptionItem
            selected={isCurrentWorkspaceMemberSelected}
            disabled={loading}
            indicator="checkbox"
            startIcon={<SelectOptionIcon Icon={IconUserCircle} />}
            onSelect={() =>
              onSelectChange({
                itemToSelect: {
                  id: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID,
                },
                isNewSelectedValue: !isCurrentWorkspaceMemberSelected,
              })
            }
          >
            {t`Me`}
          </Dropdown.OptionItem>
        </Dropdown.Section>
      )}
      {isMeVisible && <Dropdown.Separator />}
      <Dropdown.Section scrollable>
        {items.map((item) => (
          <Dropdown.OptionItem
            key={item.id}
            selected={item.isSelected}
            indicator="checkbox"
            disabled={loading}
            onSelect={() =>
              onSelectChange({
                itemToSelect: item,
                isNewSelectedValue: !item.isSelected,
              })
            }
            startIcon={
              <Avatar
                src={getAbsoluteImageUrl(item.avatarUrl)}
                colorSeed={item.id}
                name={item.name}
                size="md"
                shape={item.avatarShape}
              />
            }
          >
            {item.name}
          </Dropdown.OptionItem>
        ))}
        {hasNoResults && <Dropdown.Empty>{t`No results`}</Dropdown.Empty>}
        {loading && <Dropdown.Loading>{t`Loading...`}</Dropdown.Loading>}
      </Dropdown.Section>
    </>
  );
};
