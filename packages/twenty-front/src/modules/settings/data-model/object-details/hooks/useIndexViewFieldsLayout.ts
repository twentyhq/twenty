import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { computeFieldMetadataLayoutPositionUpdates } from '@/settings/data-model/object-details/utils/computeFieldMetadataLayoutPositionUpdates';
import { sortFieldMetadataItemsByViewLayout } from '@/settings/data-model/object-details/utils/sortFieldMetadataItemsByViewLayout';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useViewOrDefaultView } from '@/views/hooks/useViewOrDefaultView';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const DEFAULT_CREATED_VIEW_FIELD_SIZE = 100;

type PendingViewFieldLayout = {
  position?: number;
  isVisible?: boolean;
};

type ViewFieldLayoutUpdate = {
  fieldMetadataId: string;
  layout: PendingViewFieldLayout;
};

export const useIndexViewFieldsLayout = ({
  objectMetadataItem,
  fieldMetadataItems,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
}) => {
  const { view: indexView } = useViewOrDefaultView({
    objectMetadataItemId: objectMetadataItem.id,
  });

  const { performViewFieldAPICreate, performViewFieldAPIUpdate } =
    usePerformViewFieldAPIPersist();

  const [pendingLayoutByFieldMetadataId, setPendingLayoutByFieldMetadataId] =
    useState<Map<string, PendingViewFieldLayout>>(new Map());

  const viewFieldByFieldMetadataId = useMemo(
    () =>
      new Map(
        (indexView?.viewFields ?? []).map((viewField) => [
          viewField.fieldMetadataId,
          viewField,
        ]),
      ),
    [indexView],
  );

  const getEffectiveLayout = (
    fieldMetadataId: string,
  ): { position: number | null; isVisible: boolean } => {
    const pending = pendingLayoutByFieldMetadataId.get(fieldMetadataId);
    const viewField = viewFieldByFieldMetadataId.get(fieldMetadataId);

    return {
      position: pending?.position ?? viewField?.position ?? null,
      isVisible: pending?.isVisible ?? viewField?.isVisible ?? false,
    };
  };

  const positionByFieldMetadataId = useMemo(() => {
    const positions = new Map<string, number>();

    for (const field of fieldMetadataItems) {
      const pending = pendingLayoutByFieldMetadataId.get(field.id);
      const viewField = viewFieldByFieldMetadataId.get(field.id);
      const position = pending?.position ?? viewField?.position;

      if (isDefined(position)) {
        positions.set(field.id, position);
      }
    }

    return positions;
  }, [
    fieldMetadataItems,
    pendingLayoutByFieldMetadataId,
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
    if (!isDefined(indexView)) {
      return;
    }

    setPendingLayoutByFieldMetadataId((previousPending) => {
      const newPending = new Map(previousPending);

      for (const { fieldMetadataId, layout } of layoutUpdates) {
        newPending.set(fieldMetadataId, {
          ...newPending.get(fieldMetadataId),
          ...layout,
        });
      }

      return newPending;
    });

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
        const lastPosition = Math.max(
          -1,
          ...Array.from(positionByFieldMetadataId.values()),
        );

        viewFieldsToCreate.push({
          id: v4(),
          viewId: indexView.id,
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
      setPendingLayoutByFieldMetadataId((previousPending) => {
        const newPending = new Map(previousPending);

        for (const { fieldMetadataId } of layoutUpdates) {
          newPending.delete(fieldMetadataId);
        }

        return newPending;
      });
    }
  };

  const toggleFieldVisibility = async (fieldMetadataId: string) => {
    const { isVisible } = getEffectiveLayout(fieldMetadataId);

    await persistLayoutUpdates([
      { fieldMetadataId, layout: { isVisible: !isVisible } },
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
    hasEditableIndexView: isDefined(indexView),
    layoutOrderedFields,
    getEffectiveLayout,
    toggleFieldVisibility,
    reorderFieldFromDropResult,
  };
};
