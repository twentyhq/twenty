import { FileIcon } from '@/file/components/FileIcon';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldFilesValueCategory } from '@/object-record/record-field/ui/utils/getFieldFilesValueCategory';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFilesFieldLabelInputContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1;
  min-width: 0;
  padding-inline-start: ${themeCssVariables.spacing[2]};
`;

type FilesFieldLabelInputProps = {
  file: FieldFilesValue;
  value: string;
  hasError?: boolean;
  onChange: (value: string) => void;
  onEnter: () => void;
  onEscape: () => void;
};

export const FilesFieldLabelInput = ({
  file,
  value,
  hasError,
  onChange,
  onEnter,
  onEscape,
}: FilesFieldLabelInputProps) => (
  <StyledFilesFieldLabelInputContainer>
    <FileIcon
      fileCategory={getFieldFilesValueCategory(file)}
      size="small"
      thumbnailUrl={file.url}
    />
    <MultiItemFieldTextInput
      autoFocus
      spacing="compact"
      value={value}
      hasError={hasError}
      onChange={onChange}
      onEnter={onEnter}
      onEscape={onEscape}
      shouldPreventTabNavigation
    />
  </StyledFilesFieldLabelInputContainer>
);
