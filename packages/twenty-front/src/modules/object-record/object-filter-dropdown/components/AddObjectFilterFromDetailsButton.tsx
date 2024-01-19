import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { IconPlus } from '@/ui/display/icon';
import useI18n from '@/ui/i18n/useI18n';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';

type AddObjectFilterFromDetailsButtonProps = {
  filterDropdownId?: string;
};

export const AddObjectFilterFromDetailsButton = ({
  filterDropdownId,
}: AddObjectFilterFromDetailsButtonProps) => {
  const { translate } = useI18n('translations');
  const { toggleDropdown } = useDropdown(ObjectFilterDropdownId);

  const { resetFilter } = useFilterDropdown({
    filterDropdownId: filterDropdownId,
  });

  const handleClick = () => {
    resetFilter();
    toggleDropdown();
  };

  return (
    <LightButton
      onClick={handleClick}
      Icon={IconPlus}
      title={translate('addFilter')}
      accent="tertiary"
    />
  );
};
