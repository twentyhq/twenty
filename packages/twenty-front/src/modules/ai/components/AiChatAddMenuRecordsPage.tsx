import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';

import { AiChatSearchRecordOptionItem } from '@/ai/components/AiChatSearchRecordOptionItem';
import { useAiChatRecordSearch } from '@/ai/hooks/useAiChatRecordSearch';
import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';
import { type SearchRecord } from '~/generated/graphql';

type AiChatAddMenuRecordsPageProps = {
  editor: Editor | null;
};

export const AiChatAddMenuRecordsPage = ({
  editor,
}: AiChatAddMenuRecordsPageProps) => {
  const { t } = useLingui();
  const { searchableObjectMetadataItems } = useMentionSearch();
  const {
    search,
    setSearch,
    searchRecords,
    loading,
    areSearchRecordsStale,
    objectMetadataItemByNameSingular,
  } = useAiChatRecordSearch(searchableObjectMetadataItems);

  const handleRecordSelect = (record: SearchRecord) => {
    if (!isDefined(editor)) {
      return;
    }

    editor.commands.insertContent(getMentionTagContent(record));
    editor.view.focus();
  };

  return (
    <>
      <Dropdown.Back>{t`Records`}</Dropdown.Back>
      <Dropdown.Search
        aria-label={t`Search records`}
        placeholder={t`Search records`}
        value={search}
        onValueChange={setSearch}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {searchRecords.map((record) => (
          <AiChatSearchRecordOptionItem
            key={`${record.objectNameSingular}-${record.recordId}`}
            searchRecord={record}
            objectMetadataItem={objectMetadataItemByNameSingular.get(
              record.objectNameSingular,
            )}
            selected={false}
            indicator="none"
            disabled={areSearchRecordsStale}
            onSelect={() => handleRecordSelect(record)}
          />
        ))}
        {searchRecords.length === 0 &&
          (loading ? (
            <Dropdown.Loading>{t`Loading records`}</Dropdown.Loading>
          ) : (
            <Dropdown.Empty>{t`No records found`}</Dropdown.Empty>
          ))}
      </Dropdown.Section>
    </>
  );
};
