import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useRecordGroupReorder } from '@/object-record/record-group/hooks/useRecordGroupReorder';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { RecordGroupAction } from '@/object-record/record-group/types/RecordGroupActions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHasSettingsPermission } from '@/settings/roles/hooks/useHasSettingsPermission';
import { SettingsPath } from '@/types/SettingsPath';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { useCallback, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowLeft,
  IconArrowRight,
  IconEyeOff,
  IconSettings,
} from 'twenty-ui/display';
import { SettingPermissionType } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UseRecordGroupActionsParams = {
  viewType: ViewType;
};

export const useRecordGroupActions = ({
  viewType,
}: UseRecordGroupActionsParams) => {
  const navigate = useNavigateSettings();
  const location = useLocation();

  const { objectNameSingular } = useRecordIndexContextOrThrow();

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
      viewType,
    });

  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const visibleRecordGroupIds = useRecoilComponentFamilyValueV2(
    visibleRecordGroupIdsComponentFamilySelector,
    viewType,
  );

  const { reorderRecordGroups } = useRecordGroupReorder({
    viewBarId: objectMetadataItem.id,
    viewType,
  });

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

  const hasAccessToDataModelSettings = useHasSettingsPermission(
    SettingPermissionType.DATA_MODEL,
  );

  const recordGroupActions = useMemo(() => {
    const actions: RecordGroupAction[] = [];

    if (hasAccessToDataModelSettings) {
      actions.push({
        id: 'edit',
        label: 'Edit',
        icon: IconSettings,
        position: 0,
        callback: navigateToSelectSettings,
      });
    }

    const currentIndex = visibleRecordGroupIds.findIndex(
      (id) => id === recordGroupDefinition.id,
    );

    const canMoveLeft = currentIndex > 0;
    const canMoveRight = currentIndex < visibleRecordGroupIds.length - 1;

    if (canMoveRight) {
      actions.push({
        id: 'moveRight',
        label: 'Move right',
        icon: IconArrowRight,
        position: actions.length,
        callback: () => reorderRecordGroups(currentIndex, currentIndex + 1),
      });
    }

    if (canMoveLeft) {
      actions.push({
        id: 'moveLeft',
        label: 'Move left',
        icon: IconArrowLeft,
        position: actions.length,
        callback: () => reorderRecordGroups(currentIndex, currentIndex - 1),
      });
    }

    actions.push({
      id: 'hide',
      label: 'Hide',
      icon: IconEyeOff,
      position: actions.length,
      callback: () =>
        handleRecordGroupVisibilityChange({
          ...recordGroupDefinition,
          isVisible: false,
        }),
    });

    return actions;
  }, [
    hasAccessToDataModelSettings,
    visibleRecordGroupIds,
    recordGroupDefinition,
    reorderRecordGroups,
    handleRecordGroupVisibilityChange,
    navigateToSelectSettings,
  ]);

  return recordGroupActions;
};
