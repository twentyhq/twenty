import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebounce } from 'use-debounce';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelLinkAiChatToRecordsItem } from '@/side-panel/pages/link-ai-chat-to-records/components/SidePanelLinkAiChatToRecordsItem';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type SearchRecord = ReturnType<
  typeof useObjectRecordSearchRecords
>['searchRecords'][number];

type SidePanelLinkAiChatToRecordsResultsProps = {
  linkedRecordIds: string[];
  searchableObjectNameSingulars: string[];
  onToggle: (toggle: {
    recordId: string;
    objectNameSingular: string;
    isLinked: boolean;
  }) => void;
};

export const SidePanelLinkAiChatToRecordsResults = ({
  linkedRecordIds,
  searchableObjectNameSingulars,
  onToggle,
}: SidePanelLinkAiChatToRecordsResultsProps) => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search.trim(), 300);
  const [linkedRecordIdsAtOpen] = useState(linkedRecordIds);
  const hasLinkedRecords = linkedRecordIdsAtOpen.length > 0;
  const hasSearchableObjects = searchableObjectNameSingulars.length > 0;

  const linkedSearch = useObjectRecordSearchRecords({
    objectNameSingulars: searchableObjectNameSingulars,
    searchInput: debouncedSearch,
    filter: { id: { in: linkedRecordIdsAtOpen } },
    limit: DEFAULT_SEARCH_REQUEST_LIMIT,
    skip: !hasSearchableObjects || !hasLinkedRecords,
  });
  const otherSearch = useObjectRecordSearchRecords({
    objectNameSingulars: searchableObjectNameSingulars,
    searchInput: debouncedSearch,
    filter: hasLinkedRecords
      ? { not: { id: { in: linkedRecordIdsAtOpen } } }
      : {},
    limit: DEFAULT_SEARCH_REQUEST_LIMIT,
    skip: !hasSearchableObjects,
  });
  const linkedRecords =
    hasSearchableObjects && hasLinkedRecords ? linkedSearch.searchRecords : [];
  const otherRecords = hasSearchableObjects ? otherSearch.searchRecords : [];
  const isLoading =
    hasSearchableObjects && (linkedSearch.loading || otherSearch.loading);

  const renderItem = (searchRecord: SearchRecord) => {
    const isLinked = linkedRecordIds.includes(searchRecord.recordId);
    const handleToggle = () =>
      onToggle({
        recordId: searchRecord.recordId,
        objectNameSingular: searchRecord.objectNameSingular,
        isLinked,
      });

    return (
      <SelectableListItem
        key={searchRecord.recordId}
        itemId={searchRecord.recordId}
        onEnter={handleToggle}
      >
        <SidePanelLinkAiChatToRecordsItem
          recordId={searchRecord.recordId}
          objectNameSingular={searchRecord.objectNameSingular}
          objectLabelSingular={searchRecord.objectLabelSingular}
          label={searchRecord.label}
          imageUrl={searchRecord.imageUrl}
          isLinked={isLinked}
          onToggle={handleToggle}
        />
      </SelectableListItem>
    );
  };

  return (
    <>
      <ToastOnQueryErrorEffect
        error={linkedSearch.error ?? otherSearch.error}
      />
      <StyledSearchContainer>
        <DropdownMenuSearchInput
          value={search}
          placeholder={t`Search records`}
          onChange={(event) => setSearch(event.target.value)}
        />
      </StyledSearchContainer>
      <SidePanelList
        selectableItemIds={[...linkedRecords, ...otherRecords].map(
          ({ recordId }) => recordId,
        )}
        loading={isLoading}
        noResults={linkedRecords.length === 0 && otherRecords.length === 0}
      >
        <SidePanelGroup heading={t`Linked`}>
          {linkedRecords.map(renderItem)}
        </SidePanelGroup>
        {linkedRecords.length > 0 && linkedSearch.hasNextPage && (
          <CustomResolverFetchMoreLoader
            loading={linkedSearch.loading}
            onLastRowVisible={linkedSearch.fetchMoreRecords}
          />
        )}
        <SidePanelGroup heading={t`Records`}>
          {otherRecords.map(renderItem)}
        </SidePanelGroup>
        {otherRecords.length > 0 && otherSearch.hasNextPage && (
          <CustomResolverFetchMoreLoader
            loading={otherSearch.loading}
            onLastRowVisible={otherSearch.fetchMoreRecords}
          />
        )}
      </SidePanelList>
    </>
  );
};
