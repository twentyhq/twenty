import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getViewBarFilterDropdownId } from '@/views/utils/getViewBarFilterDropdownId';

import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

export const ViewBarDetailsAddFilterButton = () => {
  const { toggleDropdown } = useToggleDropdown();
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const filterDropdownId = getViewBarFilterDropdownId(recordIndexId);

  const { resetFilterDropdown } = useResetFilterDropdown(filterDropdownId);

  const handleClick = () => {
    resetFilterDropdown();
    toggleDropdown({
      dropdownComponentInstanceIdFromProps: filterDropdownId,
    });
  };

  return (
    <Button
      onClick={handleClick}
      startIcon={<IconPlus />}
      size="sm"
      variant="ghost"
      style={{
        fontWeight: 'var(--t-font-weight-regular)',
        color: 'var(--t-font-color-tertiary)',
      }}
    >{t`Add filter`}</Button>
  );
};
