import { useState } from 'react';

export type EditSubView = 'folder-picker' | null;

export const useNavigationMenuItemEditSubView = () => {
  const [editSubView, setEditSubView] = useState<EditSubView>(null);

  const setFolderPicker = () => setEditSubView('folder-picker');
  const clearSubView = () => setEditSubView(null);

  return {
    editSubView,
    setFolderPicker,
    clearSubView,
  };
};
