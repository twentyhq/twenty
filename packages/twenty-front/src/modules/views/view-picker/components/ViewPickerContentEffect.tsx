import { useEffect } from 'react';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { coreViewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreViewsFromObjectMetadataItemFamilySelector';
import { viewTypeIconMapping } from '@/views/types/ViewType';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
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
import { isDefined } from 'twenty-shared/utils';
import {
  ViewVisibility,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const ViewPickerContentEffect = () => {
  const setViewPickerSelectedIcon = useSetRecoilComponentStateV2(
    viewPickerSelectedIconComponentState,
  );
  const setViewPickerInputName = useSetRecoilComponentStateV2(
    viewPickerInputNameComponentState,
  );
  const setViewPickerVisibility = useSetRecoilComponentStateV2(
    viewPickerVisibilityComponentState,
  );
  const { viewPickerMode } = useViewPickerMode();

  const [
    viewPickerMainGroupByFieldMetadataId,
    setViewPickerMainGroupByFieldMetadataId,
  ] = useRecoilComponentStateV2(
    viewPickerMainGroupByFieldMetadataIdComponentState,
  );

  const [
    viewPickerCalendarFieldMetadataId,
    setViewPickerCalendarFieldMetadataId,
  ] = useRecoilComponentStateV2(
    viewPickerCalendarFieldMetadataIdComponentState,
  );

  const [viewPickerType, setViewPickerType] = useRecoilComponentStateV2(
    viewPickerTypeComponentState,
  );

  const viewPickerReferenceViewId = useRecoilComponentValueV2(
    viewPickerReferenceViewIdComponentState,
  );

  const viewPickerIsDirty = useRecoilComponentValueV2(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingComponentState,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const viewsOnCurrentObject = useFamilySelectorValueV2(
    coreViewsFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const referenceView = viewsOnCurrentObject.find(
    (view) => view.id === viewPickerReferenceViewId,
  );

  const { availableFieldsForGrouping } =
    useGetAvailableFieldsToGroupRecordsBy();
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
      availableFieldsForGrouping.length > 0 &&
      viewPickerMainGroupByFieldMetadataId === ''
    ) {
      setViewPickerMainGroupByFieldMetadataId(
        isDefined(referenceView.mainGroupByFieldMetadataId) &&
          referenceView.mainGroupByFieldMetadataId !== ''
          ? referenceView.mainGroupByFieldMetadataId
          : availableFieldsForGrouping[0].id,
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
    availableFieldsForGrouping,
    viewPickerMainGroupByFieldMetadataId,
    setViewPickerMainGroupByFieldMetadataId,
    availableFieldsForCalendar,
    viewPickerCalendarFieldMetadataId,
    setViewPickerCalendarFieldMetadataId,
  ]);

  return <></>;
};
