import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';

import { SidePanelObjectFilterDropdownContent } from '@/side-panel/components/SidePanelObjectFilterDropdownContent';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

export const OBJECT_FILTER_DROPDOWN_ID = 'side-panel-object-filter-dropdown';

type SidePanelObjectFilterDropdownProps = {
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SidePanelObjectFilterDropdown = ({
  selectedObjectNameSingular,
  onSelectObject,
}: SidePanelObjectFilterDropdownProps) => {
  const { t } = useLingui();
  const isFilterActive = isDefined(selectedObjectNameSingular);

  return (
    <Dropdown
      dropdownId={OBJECT_FILTER_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <IconButton
          variant="ghost"
          color={isFilterActive ? 'accent' : 'neutral'}
          size="sm"
          aria-label={t`Filter by object type`}
        >
          <IconFilter />
        </IconButton>
      }
      dropdownComponents={
        <SidePanelObjectFilterDropdownContent
          selectedObjectNameSingular={selectedObjectNameSingular}
          onSelectObject={onSelectObject}
        />
      }
    />
  );
};
