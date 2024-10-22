import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { RecordGroupAction } from '@/object-record/record-group/types/RecordGroupActions';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useCallback, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { IconEyeOff, IconSettings } from 'twenty-ui';

export const useRecordGroupActions = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { objectNameSingular, recordIndexId } = useContext(
    RecordIndexRootPropsContext,
  );

  const { columnDefinition: recordGroupDefinition } = useContext(
    RecordBoardColumnContext,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { viewGroupFieldMetadataItem } = useRecordGroups({
    objectNameSingular,
  });

  const { handleVisibilityChange: handleRecordGroupVisibilityChange } =
    useRecordGroupVisibility({
      viewBarId: recordIndexId,
    });

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);
    navigate(
      `/settings/objects/${getObjectSlug(objectMetadataItem)}/${viewGroupFieldMetadataItem?.name ?? ''}`,
    );
  }, [
    setNavigationMemorizedUrl,
    location.pathname,
    location.search,
    navigate,
    objectMetadataItem,
    viewGroupFieldMetadataItem?.name,
  ]);

  const recordGroupActions: RecordGroupAction[] = useMemo(
    () => [
      {
        id: 'edit',
        label: 'Edit',
        icon: IconSettings,
        position: 0,
        callback: () => {
          navigateToSelectSettings();
        },
      },
      {
        id: 'hide',
        label: 'Hide',
        icon: IconEyeOff,
        position: 1,
        callback: () => {
          handleRecordGroupVisibilityChange(recordGroupDefinition);
        },
      },
    ],
    [
      handleRecordGroupVisibilityChange,
      navigateToSelectSettings,
      recordGroupDefinition,
    ],
  );

  return recordGroupActions;
};
