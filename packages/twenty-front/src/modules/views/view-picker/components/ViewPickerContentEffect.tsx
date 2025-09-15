import { useEffect } from 'react';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
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
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ViewPickerContentEffect = () => {
  const setViewPickerSelectedIcon = useSetRecoilComponentState(
    viewPickerSelectedIconComponentState,
  );
  const setViewPickerInputName = useSetRecoilComponentState(
    viewPickerInputNameComponentState,
  );
  const { viewPickerMode } = useViewPickerMode();

  const [viewPickerKanbanFieldMetadataId, setViewPickerKanbanFieldMetadataId] =
    useRecoilComponentState(viewPickerKanbanFieldMetadataIdComponentState);

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
      setViewPickerInputName(referenceView.name);
      setViewPickerType(referenceView.type);
    }
  }, [
    referenceView,
    setViewPickerInputName,
    setViewPickerSelectedIcon,
    setViewPickerType,
    viewPickerIsPersisting,
    viewPickerIsDirty,
    viewPickerMode,
    viewPickerType,
  ]);

  useEffect(() => {
    if (
      isDefined(referenceView) &&
      availableFieldsForKanban.length > 0 &&
      viewPickerKanbanFieldMetadataId === ''
    ) {
      setViewPickerKanbanFieldMetadataId(
        // TODO: replace with viewGroups.fieldMetadataId
        referenceView.kanbanFieldMetadataId !== ''
          ? referenceView.kanbanFieldMetadataId
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
    viewPickerKanbanFieldMetadataId,
    setViewPickerKanbanFieldMetadataId,
    availableFieldsForCalendar,
    viewPickerCalendarFieldMetadataId,
    setViewPickerCalendarFieldMetadataId,
  ]);

  return <></>;
};
