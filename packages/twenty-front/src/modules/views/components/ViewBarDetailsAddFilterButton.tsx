import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getViewBarFilterDropdownId } from '@/views/utils/getViewBarFilterDropdownId';

import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/input';

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
    <LightButton
      onClick={handleClick}
      Icon={IconPlus}
      title={t`Add filter`}
      accent="tertiary"
    />
  );
};
