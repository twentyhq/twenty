import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useEngineCommandExecutionContext } from '@/command-menu-item/engine-command/hooks/useEngineCommandExecutionContext';
import { useRecordPageLayoutIdFromRecordStoreOrThrow } from '@/page-layout/hooks/useRecordPageLayoutIdFromRecordStoreOrThrow';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { isDefined } from 'twenty-shared/utils';
import { useResetLocationHash } from 'twenty-ui/utilities';

export const EditRecordPageLayoutSingleRecordCommand = () => {
  const { objectMetadataItem } = useEngineCommandExecutionContext();

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      'Object metadata item is required to edit record page layout',
    );
  }

  const { pageLayoutId } = useRecordPageLayoutIdFromRecordStoreOrThrow({
    targetObjectNameSingular: objectMetadataItem.nameSingular,
  });

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { resetLocationHash } = useResetLocationHash();

  const handleExecute = () => {
    setIsPageLayoutInEditMode(true);
    resetLocationHash();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
