import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconFilter } from 'twenty-ui/icon';

import { SidePanelObjectFilterDropdownContent } from '@/side-panel/components/SidePanelObjectFilterDropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';

const OBJECT_FILTER_DROPDOWN_ID = 'side-panel-object-filter-dropdown';

type SidePanelObjectFilterDropdownProps = {
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SidePanelObjectFilterDropdown = ({
  selectedObjectNameSingular,
  onSelectObject,
}: SidePanelObjectFilterDropdownProps) => {
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);

  const { t } = useLingui();
  const isFilterActive = isDefined(selectedObjectNameSingular);

  return (
    <DropdownRoot dropdownId={OBJECT_FILTER_DROPDOWN_ID} type="picker">
      <Dropdown.Trigger
        render={
          <IconButton
            variant="ghost"
            color={isFilterActive ? 'accent' : 'neutral'}
            size="sm"
            aria-label={t`Filter by object type`}
          >
            <IconFilter />
          </IconButton>
        }
      />
      <Dropdown.Content
        side="bottom"
        align="end"
        data-click-outside-id={excludedClickOutsideId}
      >
        <div data-click-outside-id={parentClickOutsideId}>
          <SidePanelObjectFilterDropdownContent
            selectedObjectNameSingular={selectedObjectNameSingular}
            onSelectObject={onSelectObject}
          />
        </div>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
