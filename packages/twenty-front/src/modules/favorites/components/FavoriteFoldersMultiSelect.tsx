import { FavoriteFoldersMultiSelectEffect } from '@/favorites/components/FavoriteFoldersSelectEffects';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { useCallback } from 'react';
import { FavoriteFoldersScope } from '../scopes/FavoriteFoldersScope';

type FavoriteFoldersMultiSelectProps = {
  onSubmit?: () => void;
  onChange?: (folderId: string) => void;
};

export const FavoriteFoldersMultiSelect = ({
  onChange,
  onSubmit,
}: FavoriteFoldersMultiSelectProps) => {
  const handleChange = useCallback(
    (folderId: string) => {
      onChange?.(folderId);
    },
    [onChange],
  );

  return (
    <>
      <FavoriteFoldersScope favoriteFoldersScopeId="favorite-folders-select">
        <FavoriteFoldersMultiSelectEffect />
        <MultiRecordSelect onChange={handleChange} onSubmit={onSubmit} />
      </FavoriteFoldersScope>
    </>
  );
};
