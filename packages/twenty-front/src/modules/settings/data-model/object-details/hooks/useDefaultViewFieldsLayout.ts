import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeFieldMetadataLayoutPositionUpdates } from '@/settings/data-model/object-details/utils/computeFieldMetadataLayoutPositionUpdates';
import { sortFieldMetadataItemsByViewLayout } from '@/settings/data-model/object-details/utils/sortFieldMetadataItemsByViewLayout';
import {
  settingsObjectFieldsPendingLayoutFamilyState,
  type PendingViewFieldLayout,
} from '@/settings/data-model/object-details/states/settingsObjectFieldsPendingLayoutFamilyState';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useViewOrDefaultView } from '@/views/hooks/useViewOrDefaultView';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useStore } from 'jotai';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const DEFAULT_CREATED_VIEW_FIELD_SIZE = 100;

type ViewFieldLayoutUpdate = {
  fieldMetadataId: string;
  layout: PendingViewFieldLayout;
};

export const useDefaultViewFieldsLayout = ({
  objectMetadataItem,
  fieldMetadataItems,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
}) => {
  const { view: defaultView } = useViewOrDefaultView({
    objectMetadataItemId: objectMetadataItem.id,
  });

  const { performViewFieldAPICreate, performViewFieldAPIUpdate } =
    usePerformViewFieldAPIPersist();

  const store = useStore();
  const pendingLayoutFamilyKey = {
    objectMetadataItemId: objectMetadataItem.id,
  };
  const pendingLayoutAtom =
    settingsObjectFieldsPendingLayoutFamilyState.atomFamily(
      pendingLayoutFamilyKey,
    );
  const settingsObjectFieldsPendingLayout = useAtomFamilyStateValue(
    settingsObjectFieldsPendingLayoutFamilyState,
    pendingLayoutFamilyKey,
  );

  const applyPendingLayoutUpdates = (
    layoutUpdates: ViewFieldLayoutUpdate[],
  ) => {
    const newPending = new Map(store.get(pendingLayoutAtom));

    for (const { fieldMetadataId, layout } of layoutUpdates) {
      newPending.set(fieldMetadataId, {
        ...newPending.get(fieldMetadataId),
        ...layout,
      });
    }

    store.set(pendingLayoutAtom, newPending);
  };

  const clearPendingLayoutUpdates = (fieldMetadataIds: string[]) => {
    const newPending = new Map(store.get(pendingLayoutAtom));

    for (const fieldMetadataId of fieldMetadataIds) {
      newPending.delete(fieldMetadataId);
    }

    store.set(pendingLayoutAtom, newPending);
  };

  const viewFieldByFieldMetadataId = useMemo(
    () =>
      new Map(
        (defaultView?.viewFields ?? []).map((viewField) => [
          viewField.fieldMetadataId,
          viewField,
        ]),
      ),
    [defaultView],
  );

  const getEffectiveLayout = (
    fieldMetadataId: string,
  ): { position: number | null; isVisible: boolean } => {
    const pending = settingsObjectFieldsPendingLayout.get(fieldMetadataId);
    const viewField = viewFieldByFieldMetadataId.get(fieldMetadataId);

    return {
      position: pending?.position ?? viewField?.position ?? null,
      isVisible: pending?.isVisible ?? viewField?.isVisible ?? false,
    };
  };

  const positionByFieldMetadataId = useMemo(() => {
    const positions = new Map<string, number>();

    for (const field of fieldMetadataItems) {
      const pending = settingsObjectFieldsPendingLayout.get(field.id);
      const viewField = viewFieldByFieldMetadataId.get(field.id);
      const position = pending?.position ?? viewField?.position;

      if (isDefined(position)) {
        positions.set(field.id, position);
      }
    }

    return positions;
  }, [
    fieldMetadataItems,
    settingsObjectFieldsPendingLayout,
    viewFieldByFieldMetadataId,
  ]);

  const layoutOrderedFields = useMemo(
    () =>
      sortFieldMetadataItemsByViewLayout({
        fieldMetadataItems,
        positionByFieldMetadataId,
      }),
    [fieldMetadataItems, positionByFieldMetadataId],
  );

  const persistLayoutUpdates = async (
    layoutUpdates: ViewFieldLayoutUpdate[],
  ) => {
    if (!isDefined(defaultView)) {
      return;
    }

    applyPendingLayoutUpdates(layoutUpdates);

    const lastPosition = Math.max(
      -1,
      ...Array.from(positionByFieldMetadataId.values()),
    );

    const viewFieldsToCreate = [];
    const viewFieldsToUpdate = [];

    for (const { fieldMetadataId, layout } of layoutUpdates) {
      const existingViewField = viewFieldByFieldMetadataId.get(fieldMetadataId);

      if (isDefined(existingViewField)) {
        viewFieldsToUpdate.push({
          input: {
            id: existingViewField.id,
            update: {
              ...(isDefined(layout.position)
                ? { position: layout.position }
                : {}),
              ...(isDefined(layout.isVisible)
                ? { isVisible: layout.isVisible }
                : {}),
            },
          },
        });
      } else {
        viewFieldsToCreate.push({
          id: v4(),
          viewId: defaultView.id,
          fieldMetadataId,
          position: layout.position ?? lastPosition + 1,
          isVisible: layout.isVisible ?? false,
          size: DEFAULT_CREATED_VIEW_FIELD_SIZE,
        });
      }
    }

    try {
      if (viewFieldsToCreate.length > 0) {
        await performViewFieldAPICreate({ inputs: viewFieldsToCreate });
      }
      if (viewFieldsToUpdate.length > 0) {
        await performViewFieldAPIUpdate(viewFieldsToUpdate);
      }
    } finally {
      clearPendingLayoutUpdates(
        layoutUpdates.map(({ fieldMetadataId }) => fieldMetadataId),
      );
    }
  };

  const toggleFieldVisibility = async (fieldMetadataId: string) => {
    const currentIsVisible =
      store.get(pendingLayoutAtom).get(fieldMetadataId)?.isVisible ??
      viewFieldByFieldMetadataId.get(fieldMetadataId)?.isVisible ??
      false;

    await persistLayoutUpdates([
      { fieldMetadataId, layout: { isVisible: !currentIsVisible } },
    ]);
  };

  const findPrecedingFieldMetadataId = ({
    movedFieldMetadataId,
    destinationIndex,
    visibleFieldMetadataItems,
  }: {
    movedFieldMetadataId: string;
    destinationIndex: number;
    visibleFieldMetadataItems: FieldMetadataItem[];
  }): string | null => {
    const visibleFieldsWithoutMoved = visibleFieldMetadataItems.filter(
      (field) => field.id !== movedFieldMetadataId,
    );
    const layoutOrderedFieldsWithoutMoved = layoutOrderedFields.filter(
      (field) => field.id !== movedFieldMetadataId,
    );

    const nextVisibleField = visibleFieldsWithoutMoved[destinationIndex];

    if (!isDefined(nextVisibleField)) {
      const lastVisibleField =
        visibleFieldsWithoutMoved[visibleFieldsWithoutMoved.length - 1];

      return lastVisibleField?.id ?? null;
    }

    const precedingField =
      layoutOrderedFieldsWithoutMoved[
        layoutOrderedFieldsWithoutMoved.findIndex(
          (field) => field.id === nextVisibleField.id,
        ) - 1
      ];

    if (isDefined(precedingField)) {
      return precedingField.id;
    }

    const firstLayoutField = layoutOrderedFieldsWithoutMoved[0];

    if (
      isDefined(firstLayoutField) &&
      firstLayoutField.id === objectMetadataItem.labelIdentifierFieldMetadataId
    ) {
      return firstLayoutField.id;
    }

    return null;
  };

  const reorderFieldFromDropResult = async ({
    dropResult,
    visibleFieldMetadataItems,
  }: {
    dropResult: DraggableListDropResult;
    visibleFieldMetadataItems: FieldMetadataItem[];
  }) => {
    if (!isDefined(dropResult.destination)) {
      return;
    }

    const movedFieldMetadataId = dropResult.draggableId;

    if (
      movedFieldMetadataId === objectMetadataItem.labelIdentifierFieldMetadataId
    ) {
      return;
    }

    const precedingFieldMetadataId = findPrecedingFieldMetadataId({
      movedFieldMetadataId,
      destinationIndex: dropResult.destination.index,
      visibleFieldMetadataItems,
    });

    const positionUpdates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: layoutOrderedFields.map((field) => ({
        id: field.id,
        position: positionByFieldMetadataId.get(field.id) ?? null,
      })),
      movedFieldMetadataId,
      precedingFieldMetadataId,
    });

    if (positionUpdates.length === 0) {
      return;
    }

    await persistLayoutUpdates(
      positionUpdates.map((update) => ({
        fieldMetadataId: update.fieldMetadataId,
        layout: { position: update.position },
      })),
    );
  };

  return {
    hasEditableDefaultView: isDefined(defaultView),
    layoutOrderedFields,
    getEffectiveLayout,
    toggleFieldVisibility,
    reorderFieldFromDropResult,
  };
};
