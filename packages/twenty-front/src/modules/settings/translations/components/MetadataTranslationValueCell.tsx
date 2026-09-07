import { type MetadataTranslationRow } from '@/settings/translations/hooks/useMetadataTranslations';
import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { MetadataTranslationProvenance } from '~/generated-metadata/graphql';

const StyledValue = styled.div<{ isInherited: boolean }>`
  color: ${({ isInherited }) =>
    isInherited
      ? themeCssVariables.font.color.light
      : themeCssVariables.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type MetadataTranslationValueCellProps = {
  row: MetadataTranslationRow;
  onSave: (value: string | null) => Promise<void>;
  disabled?: boolean;
};

export const MetadataTranslationValueCell = ({
  row,
  onSave,
  disabled = false,
}: MetadataTranslationValueCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState('');
  const isInherited =
    row.provenance === MetadataTranslationProvenance.INHERITED;

  if (!isEditing) {
    return (
      <StyledValue
        isInherited={isInherited}
        onClick={() => {
          if (disabled) {
            return;
          }
          setDraftValue(isInherited ? '' : row.value);
          setIsEditing(true);
        }}
      >
        {row.value}
      </StyledValue>
    );
  }

  return (
    <TextInput
      sizeVariant="sm"
      fullWidth
      autoFocus
      value={draftValue}
      onChange={setDraftValue}
      onBlur={async () => {
        setIsEditing(false);

        const value = draftValue.trim() === '' ? null : draftValue;

        if (value === row.value || (!isDefined(value) && isInherited)) {
          return;
        }

        await onSave(value);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          setIsEditing(false);
        }
      }}
    />
  );
};
