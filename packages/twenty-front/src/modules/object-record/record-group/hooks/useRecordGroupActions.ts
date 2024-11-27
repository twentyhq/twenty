import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { RecordGroupAction } from '@/object-record/record-group/types/RecordGroupActions';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useCallback, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { IconEyeOff, IconSettings, isDefined } from 'twenty-ui';

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

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  const { handleVisibilityChange: handleRecordGroupVisibilityChange } =
    useRecordGroupVisibility({
      viewBarId: recordIndexId,
    });

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);

    if (!isDefined(recordGroupFieldMetadata)) {
      throw new Error('recordGroupFieldMetadata is not a non-empty string');
    }

    const settingsPath = `/settings/objects/${getObjectSlug(objectMetadataItem)}/${getFieldSlug(recordGroupFieldMetadata)}`;

    navigate(settingsPath);
  }, [
    setNavigationMemorizedUrl,
    location.pathname,
    location.search,
    navigate,
    objectMetadataItem,
    recordGroupFieldMetadata,
  ]);

  const recordGroupActions: RecordGroupAction[] = useMemo(
    () =>
      [
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
      ].filter(isDefined),
    [
      handleRecordGroupVisibilityChange,
      navigateToSelectSettings,
      recordGroupDefinition,
    ],
  );

  return recordGroupActions;
};
