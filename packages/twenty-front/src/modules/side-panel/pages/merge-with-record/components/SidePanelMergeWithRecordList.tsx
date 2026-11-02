import { styled } from '@linaria/react';
import { useState } from 'react';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebounce } from 'use-debounce';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useOpenMergeRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenMergeRecordsPageInSidePanel';
import { type MergeWithRecordSource } from '@/side-panel/pages/merge-with-record/types/MergeWithRecordSource';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type SidePanelMergeWithRecordListProps = MergeWithRecordSource;

export const SidePanelMergeWithRecordList = ({
  objectNameSingular,
  recordId,
}: SidePanelMergeWithRecordListProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search.trim(), 300);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { searchRecords, loading, error } = useObjectRecordSearchRecords({
    objectNameSingulars: [objectNameSingular],
    searchInput: debouncedSearch,
    filter: { not: { id: { in: [recordId] } } },
    limit: DEFAULT_SEARCH_REQUEST_LIMIT,
  });

  const { openMergeRecordsPageInSidePanel } =
    useOpenMergeRecordsPageInSidePanel({ objectNameSingular });

  // A double click would otherwise push two merge pages while the records load
  const [isOpeningMerge, setIsOpeningMerge] = useState(false);

  const handleSelect = async (otherRecordId: string) => {
    if (isOpeningMerge) {
      return;
    }

    setIsOpeningMerge(true);

    try {
      await openMergeRecordsPageInSidePanel([recordId, otherRecordId]);
    } finally {
      setIsOpeningMerge(false);
    }
  };

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />
      <StyledSearchContainer>
        <DropdownMenuSearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </StyledSearchContainer>
      <SidePanelList
        selectableItemIds={searchRecords.map(
          (searchRecord) => searchRecord.recordId,
        )}
        loading={loading}
        noResults={searchRecords.length === 0}
      >
        {searchRecords.map((searchRecord) => (
          <SelectableListItem
            key={searchRecord.recordId}
            itemId={searchRecord.recordId}
            onEnter={() => handleSelect(searchRecord.recordId)}
          >
            <CommandMenuItem
              id={searchRecord.recordId}
              label={searchRecord.label}
              onClick={() => handleSelect(searchRecord.recordId)}
              LeftComponent={
                <Avatar
                  shape={getAvatarShape(objectMetadataItem)}
                  src={getAbsoluteImageUrl(searchRecord.imageUrl)}
                  colorSeed={searchRecord.recordId}
                  name={searchRecord.label}
                />
              }
            />
          </SelectableListItem>
        ))}
      </SidePanelList>
    </>
  );
};
