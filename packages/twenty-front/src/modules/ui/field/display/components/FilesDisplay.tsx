import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { t } from '@lingui/core/macro';
import { Chip, ChipVariant } from 'twenty-ui/components';

type FilesDisplayProps = {
  value: FieldFilesValue;
};

//TODO: Draft version, UI to be improved
export const FilesDisplay = ({ value }: FilesDisplayProps) => {
  return (
    <ExpandableList>
      {value?.map((file, index) => (
        <Chip
          key={`${file.fileId}-${index}`}
          variant={ChipVariant.Highlighted}
          label={file.label}
          emptyLabel={t`Untitled`}
        />
      ))}
    </ExpandableList>
  );
};
