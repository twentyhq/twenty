import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import {
  savedPageLayoutsState,
  type SavedPageLayout,
} from '../states/savedPageLayoutsState';
import { type PageLayoutFormData } from './usePageLayoutFormState';

export const usePageLayoutSaveHandler = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== 'new';
  const [savedPageLayouts, setSavedPageLayouts] = useRecoilState(
    savedPageLayoutsState,
  );

  const existingLayout = isEditMode
    ? savedPageLayouts.find((layout) => layout.id === id)
    : undefined;

  const handleSave = useCallback(
    async (formData: PageLayoutFormData) => {
      const layoutToSave: SavedPageLayout = {
        id: isEditMode ? id : uuidv4(),
        name: formData.name,
        type: formData.type,
        createdAt: isEditMode
          ? existingLayout?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgets: formData.widgets,
      };

      setSavedPageLayouts((prev) => {
        if (isDefined(isEditMode)) {
          return prev.map((layout) =>
            layout.id === id ? layoutToSave : layout,
          );
        }
        return [...prev, layoutToSave];
      });

      navigate('/settings/page-layout');
    },
    [isEditMode, id, existingLayout?.createdAt, setSavedPageLayouts, navigate],
  );

  return { handleSave };
};
