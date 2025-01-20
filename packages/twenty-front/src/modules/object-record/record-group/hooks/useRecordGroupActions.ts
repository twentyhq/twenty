import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { RecordGroupAction } from '@/object-record/record-group/types/RecordGroupActions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { SettingsPath } from '@/types/SettingsPath';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { useCallback, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { IconEyeOff, IconSettings, isDefined } from 'twenty-ui';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UseRecordGroupActionsParams = {
  viewType: ViewType;
};

export const useRecordGroupActions = ({
  viewType,
}: UseRecordGroupActionsParams) => {
  const navigate = useNavigateSettings();
  const location = useLocation();

  const { objectNameSingular, recordIndexId } = useRecordIndexContextOrThrow();

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
      viewType,
    });

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const navigateToSelectSettings = useCallback(() => {
    setNavigationMemorizedUrl(location.pathname + location.search);

    if (!isDefined(recordGroupFieldMetadata)) {
      throw new Error('recordGroupFieldMetadata is not a non-empty string');
    }

    navigate(SettingsPath.ObjectFieldEdit, {
      objectNamePlural: objectMetadataItem.namePlural,
      fieldName: recordGroupFieldMetadata.name,
    });
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
