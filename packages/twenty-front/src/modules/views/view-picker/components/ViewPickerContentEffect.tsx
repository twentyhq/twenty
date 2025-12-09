import { useEffect } from 'react';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { coreViewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreViewsFromObjectMetadataItemFamilySelector';
import { viewTypeIconMapping } from '@/views/types/ViewType';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerCalendarFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerCalendarFieldMetadataIdComponentState';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerMainGroupByFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerMainGroupByFieldMetadataIdComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { viewPickerVisibilityComponentState } from '@/views/view-picker/states/viewPickerVisibilityComponentState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ViewVisibility } from '~/generated-metadata/graphql';
import { PermissionFlagType } from '~/generated/graphql';

export const ViewPickerContentEffect = () => {
  const setViewPickerSelectedIcon = useSetRecoilComponentState(
    viewPickerSelectedIconComponentState,
  );
  const setViewPickerInputName = useSetRecoilComponentState(
    viewPickerInputNameComponentState,
  );
  const setViewPickerVisibility = useSetRecoilComponentState(
    viewPickerVisibilityComponentState,
  );
  const { viewPickerMode } = useViewPickerMode();

  const [
    viewPickerMainGroupByFieldMetadataId,
    setViewPickerMainGroupByFieldMetadataId,
  ] = useRecoilComponentState(
    viewPickerMainGroupByFieldMetadataIdComponentState,
  );

  const [
    viewPickerCalendarFieldMetadataId,
    setViewPickerCalendarFieldMetadataId,
  ] = useRecoilComponentState(viewPickerCalendarFieldMetadataIdComponentState);

  const [viewPickerType, setViewPickerType] = useRecoilComponentState(
    viewPickerTypeComponentState,
  );

  const viewPickerReferenceViewId = useRecoilComponentValue(
    viewPickerReferenceViewIdComponentState,
  );

  const viewPickerIsDirty = useRecoilComponentValue(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerIsPersisting = useRecoilComponentValue(
    viewPickerIsPersistingComponentState,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const viewsOnCurrentObject = useRecoilValue(
    coreViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const referenceView = viewsOnCurrentObject.find(
    (view) => view.id === viewPickerReferenceViewId,
  );

  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();
  const { availableFieldsForCalendar } = useGetAvailableFieldsForCalendar();
  const hasViewPermission = useHasPermissionFlag(PermissionFlagType.VIEWS);

  useEffect(() => {
    if (
      isDefined(referenceView) &&
      !viewPickerIsPersisting &&
      !viewPickerIsDirty
    ) {
      const defaultIcon =
        viewTypeIconMapping(viewPickerType).displayName ?? 'IconTable';

      if (viewPickerMode === 'create-empty') {
        setViewPickerSelectedIcon(defaultIcon);
      } else {
        setViewPickerSelectedIcon(referenceView.icon);
      }
      setViewPickerVisibility(
        hasViewPermission ? referenceView.visibility : ViewVisibility.UNLISTED,
      );
      setViewPickerInputName(referenceView.name);
      setViewPickerType(referenceView.type);
    }
  }, [
    referenceView,
    setViewPickerInputName,
    setViewPickerSelectedIcon,
    setViewPickerType,
    setViewPickerVisibility,
    viewPickerIsPersisting,
    viewPickerIsDirty,
    viewPickerMode,
    viewPickerType,
    hasViewPermission,
  ]);

  useEffect(() => {
    if (
      isDefined(referenceView) &&
      availableFieldsForKanban.length > 0 &&
      viewPickerMainGroupByFieldMetadataId === ''
    ) {
      setViewPickerMainGroupByFieldMetadataId(
        isDefined(referenceView.mainGroupByFieldMetadataId) &&
          referenceView.mainGroupByFieldMetadataId !== ''
          ? referenceView.mainGroupByFieldMetadataId
          : availableFieldsForKanban[0].id,
      );
    }
    if (
      isDefined(referenceView) &&
      availableFieldsForCalendar.length > 0 &&
      viewPickerCalendarFieldMetadataId === ''
    ) {
      setViewPickerCalendarFieldMetadataId(
        isDefined(referenceView.calendarFieldMetadataId) &&
          referenceView.calendarFieldMetadataId !== ''
          ? referenceView.calendarFieldMetadataId
          : availableFieldsForCalendar[0].id,
      );
    }
  }, [
    referenceView,
    availableFieldsForKanban,
    viewPickerMainGroupByFieldMetadataId,
    setViewPickerMainGroupByFieldMetadataId,
    availableFieldsForCalendar,
    viewPickerCalendarFieldMetadataId,
    setViewPickerCalendarFieldMetadataId,
  ]);

  return <></>;
};
