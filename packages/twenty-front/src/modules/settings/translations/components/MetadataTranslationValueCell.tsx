import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type MetadataTranslationsQuery,
  MetadataTranslationProvenance,
} from '~/generated-metadata/graphql';

export type MetadataTranslationRow =
  MetadataTranslationsQuery['metadataTranslations'][number];

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

// Click-to-edit resolved value: blur or Enter saves, Escape cancels, an
// emptied input reverts the stored translation.
export const MetadataTranslationValueCell = ({
  row,
  onSave,
  disabled = false,
}: {
  row: MetadataTranslationRow;
  onSave: (value: string | null) => Promise<void>;
  disabled?: boolean;
}) => {
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

        if (value === row.value || (value === null && isInherited)) {
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
