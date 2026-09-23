import { useHandleSidePanelEscape } from '@/side-panel/hooks/useHandleSidePanelEscape';

export const useRecordCreationFormFieldEscape = () => {
  const handleSidePanelEscape = useHandleSidePanelEscape();

  return () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    handleSidePanelEscape();
  };
};
