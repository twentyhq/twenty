import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { RecordGroupAction } from '@/object-record/record-group/types/RecordGroupActions';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
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

    if (!isDefined(viewGroupFieldMetadataItem)) {
      throw new Error('viewGroupFieldMetadataItem is not a non-empty string');
    }

    const settingsPath = `/settings/objects/${getObjectSlug(objectMetadataItem)}/${getFieldSlug(viewGroupFieldMetadataItem)}`;

    navigate(settingsPath);
  }, [
    setNavigationMemorizedUrl,
    location.pathname,
    location.search,
    navigate,
    objectMetadataItem,
    viewGroupFieldMetadataItem,
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
        recordGroupDefinition.type !== RecordGroupDefinitionType.NoValue
          ? {
              id: 'hide',
              label: 'Hide',
              icon: IconEyeOff,
              position: 1,
              callback: () => {
                handleRecordGroupVisibilityChange(recordGroupDefinition);
              },
            }
          : undefined,
      ].filter(isDefined),
    [
      handleRecordGroupVisibilityChange,
      navigateToSelectSettings,
      recordGroupDefinition,
    ],
  );

  return recordGroupActions;
};
