import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';

import { AiChatSearchRecordOptionItem } from '@/ai/components/AiChatSearchRecordOptionItem';
import { AiChatThreadLinkedRecordOptionItem } from '@/ai/components/AiChatThreadLinkedRecordOptionItem';
import { useAiChatRecordSearch } from '@/ai/hooks/useAiChatRecordSearch';
import { type AgentChatConversationTarget } from '@/ai/types/AgentChatConversationTarget';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldWidgetRelationRecord } from '@/page-layout/widgets/field/types/FieldWidgetRelationRecord';

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
  const {
    search,
    setSearch,
    trimmedSearch,
    searchRecords,
    areSearchRecordsStale,
    objectMetadataItemByNameSingular,
  } = useAiChatRecordSearch(linkableObjectMetadataItems);

  const linkedRecordIds = new Set(linkedRecords.map(({ record }) => record.id));
  // Linked records lead an empty search, so they can be unlinked without
  // being searched for
  const isShowingLinkedRecords = trimmedSearch === '';
  const searchRecordsToShow = isShowingLinkedRecords
    ? searchRecords.filter(({ recordId }) => !linkedRecordIds.has(recordId))
    : searchRecords;
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
            <AiChatSearchRecordOptionItem
              key={`${searchRecord.objectNameSingular}-${searchRecord.recordId}`}
              searchRecord={searchRecord}
              objectMetadataItem={objectMetadataItemByNameSingular.get(
                searchRecord.objectNameSingular,
              )}
              selected={isLinked}
              indicator="checkbox"
              disabled={areSearchRecordsStale}
              onSelect={() => (isLinked ? onUnlink(target) : onLink(target))}
            />
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
