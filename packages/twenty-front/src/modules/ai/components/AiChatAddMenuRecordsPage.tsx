import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useDebounce } from 'use-debounce';

import { useMentionSearch } from '@/mention/hooks/useMentionSearch';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { type SearchRecord } from '~/generated/graphql';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type AiChatAddMenuRecordsPageProps = {
  editor: Editor | null;
};

export const AiChatAddMenuRecordsPage = ({
  editor,
}: AiChatAddMenuRecordsPageProps) => {
  const { t } = useLingui();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search.trim(), 300);
  const { searchableObjectMetadataItems } = useMentionSearch();
  const searchableObjectMetadataItemByNameSingular = new Map(
    searchableObjectMetadataItems.map((objectMetadataItem) => [
      objectMetadataItem.nameSingular,
      objectMetadataItem,
    ]),
  );

  const { searchRecords, loading } = useObjectRecordSearchRecords({
    objectNameSingulars: searchableObjectMetadataItems.map(
      ({ nameSingular }) => nameSingular,
    ),
    searchInput: debouncedSearch,
    skip: searchableObjectMetadataItems.length === 0,
  });

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
          <Dropdown.OptionItem
            key={`${record.objectNameSingular}-${record.recordId}`}
            selected={false}
            indicator="none"
            startIcon={
              <Avatar
                name={record.label}
                colorSeed={record.recordId}
                src={getAbsoluteImageUrl(record.imageUrl)}
                shape={getAvatarShape(
                  searchableObjectMetadataItemByNameSingular.get(
                    record.objectNameSingular,
                  ),
                )}
                size="sm"
              />
            }
            description={record.objectLabelSingular}
            descriptionPlacement="end"
            onSelect={() => handleRecordSelect(record)}
          >
            {record.label}
          </Dropdown.OptionItem>
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
