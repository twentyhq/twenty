import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilValue } from 'recoil';

export const useOpenSingleRecordAction: ActionHookWithObjectMetadataItem = ({
  objectMetadataItem,
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  const isSidePanelViewOpenRecordInType =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL;
  const onClick = isSidePanelViewOpenRecordInType
    ? () =>
        openRecordInCommandMenu({
          recordId,
          objectNameSingular: objectMetadataItem.nameSingular,
        })
    : () => {};

  return {
    shouldBeRegistered: true,
    onClick,
  };
};
