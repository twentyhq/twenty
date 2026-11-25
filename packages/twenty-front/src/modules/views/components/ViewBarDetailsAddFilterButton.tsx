import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getViewBarFilterDropdownId } from '@/views/utils/getViewBarFilterDropdownId';

import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { LightButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

export const ViewBarDetailsAddFilterButton = () => {
  const { t } = useLingui();
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
      emphasis="subtle"
      onClick={handleClick}
      startIcon={<IconPlus />}
    >{t`Add filter`}</LightButton>
  );
};
