import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconCheck } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useDebounce } from 'use-debounce';

import { useAiChatThreadRecordTargets } from '@/ai-chat/threads/hooks/useAiChatThreadRecordTargets';
import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { DEFAULT_SEARCH_REQUEST_LIMIT } from '@/object-record/constants/DefaultSearchRequestLimit';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledSearchContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type SearchRecord = ReturnType<
  typeof useObjectRecordSearchRecords
>['searchRecords'][number];

type SidePanelLinkAiChatToRecordsListProps = {
  threadId: string;
};

export const SidePanelLinkAiChatToRecordsList = ({
  threadId,
}: SidePanelLinkAiChatToRecordsListProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search.trim(), 300);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { targetRecords, searchableObjectNameSingulars, toggleRecordTarget } =
    useAiChatThreadRecordTargets({
      threadId,
      instanceId: `ai-chat-link-records-${threadId}`,
    });
  const linkedRecordIds = targetRecords.map(({ record }) => record.id);
  const hasLinkedRecords = linkedRecordIds.length > 0;

  const linkedSearch = useObjectRecordSearchRecords({
    objectNameSingulars: searchableObjectNameSingulars,
    searchInput: debouncedSearch,
    filter: { id: { in: linkedRecordIds } },
    limit: DEFAULT_SEARCH_REQUEST_LIMIT,
    skip: !hasLinkedRecords,
  });
  const otherSearch = useObjectRecordSearchRecords({
    objectNameSingulars: searchableObjectNameSingulars,
    searchInput: debouncedSearch,
    filter: hasLinkedRecords ? { not: { id: { in: linkedRecordIds } } } : {},
    limit: DEFAULT_SEARCH_REQUEST_LIMIT,
  });
  const linkedRecords = hasLinkedRecords ? linkedSearch.searchRecords : [];
  const otherRecords = otherSearch.searchRecords;

  const renderItem = (searchRecord: SearchRecord, isLinked: boolean) => {
    const handleToggle = () =>
      toggleRecordTarget({
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
        <CommandMenuItem
          id={searchRecord.recordId}
          label={searchRecord.label}
          description={searchRecord.objectLabelSingular}
          onClick={handleToggle}
          LeftComponent={
            <Avatar
              shape={getAvatarShape(
                objectMetadataItems.find(
                  ({ nameSingular }) =>
                    nameSingular === searchRecord.objectNameSingular,
                ),
              )}
              src={getAbsoluteImageUrl(searchRecord.imageUrl)}
              colorSeed={searchRecord.recordId}
              name={searchRecord.label}
            />
          }
          RightComponent={
            isLinked ? <IconCheck size={theme.icon.size.md} /> : undefined
          }
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
        loading={linkedSearch.loading || otherSearch.loading}
        noResults={linkedRecords.length === 0 && otherRecords.length === 0}
      >
        <SidePanelGroup heading={t`Linked`}>
          {linkedRecords.map((searchRecord) => renderItem(searchRecord, true))}
        </SidePanelGroup>
        <SidePanelGroup heading={t`Records`}>
          {otherRecords.map((searchRecord) => renderItem(searchRecord, false))}
        </SidePanelGroup>
      </SidePanelList>
    </>
  );
};
