import { Action } from '@/action-menu/actions/components/Action';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { useResetLocationHash } from 'twenty-ui/utilities';

export const EditRecordPageLayoutSingleRecordAction = () => {
  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetLocationHash } = useResetLocationHash();

  const handleClick = () => {
    setIsPageLayoutInEditMode(true);
    resetLocationHash();
  };

  return <Action onClick={handleClick} />;
};
