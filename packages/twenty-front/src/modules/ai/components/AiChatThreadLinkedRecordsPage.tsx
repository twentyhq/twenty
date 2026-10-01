import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useDebounce } from 'use-debounce';

import { AiChatThreadLinkedRecordOptionItem } from '@/ai/components/AiChatThreadLinkedRecordOptionItem';
import { type AgentChatConversationTarget } from '@/ai/types/AgentChatConversationTarget';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { type FieldWidgetRelationRecord } from '@/page-layout/widgets/field/types/FieldWidgetRelationRecord';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type AiChatThreadLinkedRecordsPageProps = {
  linkedRecords: FieldWidgetRelationRecord[];
  linkableObjectMetadataItems: EnrichedObjectMetadataItem[];
  onLink: (target: AgentChatConversationTarget) => void;
  onUnlink: (target: AgentChatConversationTarget) => void;
};

export const AiChatThreadLinkedRecordsPage = ({
  linkedRecords,
  linkableObjectMetadataItems,
  onLink,
  onUnlink,
}: AiChatThreadLinkedRecordsPageProps) => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const [debouncedSearch] = useDebounce(trimmedSearch, 300);

  const { searchRecords, loading } = useObjectRecordSearchRecords({
    objectNameSingulars: linkableObjectMetadataItems.map(
      ({ nameSingular }) => nameSingular,
    ),
    searchInput: debouncedSearch,
    skip: linkableObjectMetadataItems.length === 0,
  });
  const areSearchRecordsStale = loading || debouncedSearch !== trimmedSearch;

  const linkedRecordIds = new Set(linkedRecords.map(({ record }) => record.id));
  // Linked records lead an empty search, so they can be unlinked without
  // being searched for
  const isShowingLinkedRecords = trimmedSearch === '';
  const searchRecordsToShow = isShowingLinkedRecords
    ? searchRecords.filter(({ recordId }) => !linkedRecordIds.has(recordId))
    : searchRecords;
  const linkableObjectMetadataItemByNameSingular = new Map(
    linkableObjectMetadataItems.map((objectMetadataItem) => [
      objectMetadataItem.nameSingular,
      objectMetadataItem,
    ]),
  );
  const hasNoOptions =
    searchRecordsToShow.length === 0 &&
    (!isShowingLinkedRecords || linkedRecords.length === 0);

  return (
    <>
      <Dropdown.Back>{t`Linked to`}</Dropdown.Back>
      <Dropdown.Search
        aria-label={t`Search records`}
        placeholder={t`Search records`}
        value={search}
        onValueChange={setSearch}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {isShowingLinkedRecords &&
          linkedRecords.map(({ record, objectNameSingular }) => (
            <AiChatThreadLinkedRecordOptionItem
              key={`${objectNameSingular}-${record.id}`}
              record={record}
              objectNameSingular={objectNameSingular}
              onUnlink={() =>
                onUnlink({ objectNameSingular, recordId: record.id })
              }
            />
          ))}
        {searchRecordsToShow.map((searchRecord) => {
          const target = {
            objectNameSingular: searchRecord.objectNameSingular,
            recordId: searchRecord.recordId,
          };
          const isLinked = linkedRecordIds.has(searchRecord.recordId);

          return (
            <Dropdown.OptionItem
              key={`${searchRecord.objectNameSingular}-${searchRecord.recordId}`}
              selected={isLinked}
              indicator="checkbox"
              disabled={areSearchRecordsStale}
              startIcon={
                <Avatar
                  name={searchRecord.label}
                  colorSeed={searchRecord.recordId}
                  src={getAbsoluteImageUrl(searchRecord.imageUrl)}
                  shape={getAvatarShape(
                    linkableObjectMetadataItemByNameSingular.get(
                      searchRecord.objectNameSingular,
                    ),
                  )}
                  size="sm"
                />
              }
              description={searchRecord.objectLabelSingular}
              onSelect={() => (isLinked ? onUnlink(target) : onLink(target))}
            >
              {searchRecord.label}
            </Dropdown.OptionItem>
          );
        })}
        {hasNoOptions &&
          (areSearchRecordsStale ? (
            <Dropdown.Loading>{t`Loading records`}</Dropdown.Loading>
          ) : (
            <Dropdown.Empty>{t`No records found`}</Dropdown.Empty>
          ))}
      </Dropdown.Section>
    </>
  );
};
