import { FileIcon } from '@/file/components/FileIcon';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFileCategoryFromExtension } from '@/object-record/record-field/ui/utils/getFileCategoryFromExtension';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant } from 'twenty-ui/components';

type FilesDisplayProps = {
  value?: FieldFilesValue;
};

export const FilesDisplay = ({ value }: FilesDisplayProps) => {
  if (!isDefined(value) || value.length === 0) {
    return <></>;
  }

  return (
    <ExpandableList>
      {value.map((file, index) => (
        <Chip
          key={index}
          label={file.label}
          leftComponent={
            <FileIcon
              fileCategory={getFileCategoryFromExtension(file.extension ?? '')}
            />
          }
          variant={ChipVariant.Rounded}
        />
      ))}
    </ExpandableList>
  );
};
