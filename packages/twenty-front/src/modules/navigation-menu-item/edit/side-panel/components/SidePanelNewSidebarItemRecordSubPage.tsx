import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useAvailableNavigationMenuItemSearchRecords } from '@/navigation-menu-item/edit/side-panel/hooks/useAvailableNavigationMenuItemSearchRecords';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelObjectFilterDropdown } from '@/side-panel/components/SidePanelObjectFilterDropdown';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { SidePanelNewSidebarItemRecordItem } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemRecordItem';

export const SidePanelNewSidebarItemRecordSubPage = () => {
  const { t } = useLingui();
  const [recordSearchInput, setRecordSearchInput] = useState('');
  const [selectedObjectNameSingular, setSelectedObjectNameSingular] = useState<
    string | null
  >(null);
  const { availableSearchRecords, deferredSearchInput, recordSearchLoading } =
    useAvailableNavigationMenuItemSearchRecords({
      searchInput: recordSearchInput,
      selectedObjectNameSingular,
    });

  const isEmpty = availableSearchRecords.length === 0 && !recordSearchLoading;
  const selectableItemIds = isEmpty
    ? []
    : availableSearchRecords.map((record) => record.recordId);
  const noResultsText = isNonEmptyString(deferredSearchInput.trim())
    ? t`No results found`
    : t`Type to search records`;

  return (
    <SidePanelSubViewWithSearch
      searchPlaceholder={t`Search records...`}
      searchValue={recordSearchInput}
      onSearchChange={setRecordSearchInput}
      rightElement={
        <SidePanelObjectFilterDropdown
          selectedObjectNameSingular={selectedObjectNameSingular}
          onSelectObject={setSelectedObjectNameSingular}
        />
      }
    >
      <SidePanelAddToNavigationDroppable>
        {({ innerRef, droppableProps, placeholder }) => (
          <SidePanelList
            selectableItemIds={selectableItemIds}
            loading={recordSearchLoading}
            noResults={isEmpty}
            noResultsText={noResultsText}
          >
            {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
            <div ref={innerRef} {...droppableProps}>
              <SidePanelGroup heading={t`Results`}>
                {availableSearchRecords.map((record, index) => (
                  <SidePanelNewSidebarItemRecordItem
                    key={record.recordId}
                    record={record}
                    dragIndex={index}
                  />
                ))}
              </SidePanelGroup>
              {placeholder}
            </div>
          </SidePanelList>
        )}
      </SidePanelAddToNavigationDroppable>
    </SidePanelSubViewWithSearch>
  );
};
