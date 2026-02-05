import { Action } from '@/action-menu/actions/components/Action';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useResetDraftPageLayoutToPersistedPageLayout } from '@/page-layout/hooks/useResetDraftPageLayoutToPersistedPageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';

export const CancelRecordPageLayoutSingleRecordAction = () => {
  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow();

  const { closeCommandMenu } = useCommandMenu();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetDraftPageLayoutToPersistedPageLayout } =
    useResetDraftPageLayoutToPersistedPageLayout(pageLayoutId);

  const handleClick = () => {
    closeCommandMenu();

    resetDraftPageLayoutToPersistedPageLayout();
    setIsPageLayoutInEditMode(false);
  };

  return <Action onClick={handleClick} />;
};
