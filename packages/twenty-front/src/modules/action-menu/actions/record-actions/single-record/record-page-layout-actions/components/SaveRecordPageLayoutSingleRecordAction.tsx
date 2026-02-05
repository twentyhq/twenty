import { Action } from '@/action-menu/actions/components/Action';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';

export const SaveRecordPageLayoutSingleRecordAction = () => {
  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow();

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { closeCommandMenu } = useCommandMenu();

  const handleClick = async () => {
    const result = await savePageLayout();

    if (result.status === 'successful') {
      closeCommandMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <Action onClick={handleClick} />;
};
