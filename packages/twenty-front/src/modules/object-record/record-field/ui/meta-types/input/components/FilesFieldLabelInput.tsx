import { FileIcon } from '@/file/components/FileIcon';
import { type MultiItemBaseInputProps } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemBaseInputProps';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getFieldFilesValueCategory } from '@/object-record/record-field/ui/utils/getFieldFilesValueCategory';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFilesFieldLabelInputContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[8]};

  &[data-in-row='true'] {
    align-self: stretch;
    flex: 1;
    height: auto;
    min-width: 0;
    padding-right: 0;
  }
`;

const StyledLabelInput = styled(StyledTextInput)`
  &[data-in-row='true'] {
    padding-left: ${themeCssVariables.spacing[1]};
  }
`;

type FilesFieldLabelInputProps = Parameters<
  NonNullable<MultiItemBaseInputProps['renderInput']>
>[0] & {
  file?: FieldFilesValue;
};

export const FilesFieldLabelInput = ({
  file,
  value,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  autoFocus,
  placeholder,
  isInRow,
}: FilesFieldLabelInputProps) => (
  <StyledFilesFieldLabelInputContainer data-in-row={isInRow}>
    {isDefined(file) && (
      <FileIcon
        fileCategory={getFieldFilesValueCategory(file)}
        size="small"
        thumbnailUrl={file.url}
      />
    )}
    <StyledLabelInput
      data-in-row={isInRow}
      autoComplete="off"
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  </StyledFilesFieldLabelInputContainer>
);
