import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useCloneViewInMetadataStore } from '@/page-layout/hooks/useCloneViewInMetadataStore';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildFieldsWidgetGroupsFromFlatViewData } from '@/page-layout/utils/buildFieldsWidgetGroupsFromFlatViewData';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { WidgetType } from '~/generated-metadata/graphql';

type DuplicateFieldsWidgetParams = {
  sourceWidget: PageLayoutWidget;
  newWidgetId: string;
};

type DuplicateFieldsWidgetResult = {
  newViewId: string;
};

const stripViewFieldId = (
  field: FieldsWidgetGroupField,
): FieldsWidgetGroupField => {
  const { viewFieldId: _omit, ...rest } = field;

  return rest;
};

export const useDuplicateFieldsWidgetForPageLayout = ({
  pageLayoutId,
}: {
  pageLayoutId: string;
}) => {
  const store = useStore();

  const { cloneView } = useCloneViewInMetadataStore();

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      pageLayoutId,
    );

  const fieldsWidgetEditorModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModeDraftComponentState,
    pageLayoutId,
  );

  const duplicateFieldsWidget = useCallback(
    ({
      sourceWidget,
      newWidgetId,
    }: DuplicateFieldsWidgetParams): DuplicateFieldsWidgetResult | null => {
      if (sourceWidget.type !== WidgetType.FIELDS) {
        return null;
      }

      const sourceViewId = getWidgetConfigurationViewId(
        sourceWidget.configuration,
      );

      if (!isDefined(sourceViewId)) {
        return null;
      }

      const copyResult = cloneView(sourceViewId);

      if (!isDefined(copyResult)) {
        return null;
      }

      const sourceGroups = store.get(fieldsWidgetGroupsDraftState)[
        sourceWidget.id
      ];
      const sourceUngroupedFields = store.get(
        fieldsWidgetUngroupedFieldsDraftState,
      )[sourceWidget.id];
      const sourceEditorMode = store.get(fieldsWidgetEditorModeDraftState)[
        sourceWidget.id
      ];

      let newGroups: FieldsWidgetGroup[] = [];
      let newUngroupedFields: FieldsWidgetGroupField[] = [];
      let newEditorMode: FieldsWidgetEditorMode;

      if (isDefined(sourceEditorMode)) {
        newEditorMode = sourceEditorMode;

        if (newEditorMode === 'grouped') {
          newGroups = (sourceGroups ?? []).map((group) => ({
            ...group,
            id: uuidv4(),
            fields: group.fields.map(stripViewFieldId),
          }));
        } else {
          newUngroupedFields = (sourceUngroupedFields ?? []).map(
            stripViewFieldId,
          );
        }
      } else {
        const pageLayoutDraft = store.get(pageLayoutDraftState);
        const objectMetadataId = pageLayoutDraft.objectMetadataId;
        const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);
        const fieldMetadataItems = isDefined(objectMetadataId)
          ? (objectMetadataItems.find((item) => item.id === objectMetadataId)
              ?.fields ?? [])
          : [];

        const built = buildFieldsWidgetGroupsFromFlatViewData({
          flatViewFieldGroups: copyResult.copiedViewFieldGroups,
          flatViewFields: copyResult.copiedViewFields,
          fieldMetadataItems,
        });

        newEditorMode = built.editorMode;
        newGroups = built.groups;
        newUngroupedFields = built.ungroupedFields;
      }

      store.set(fieldsWidgetGroupsDraftState, (prev) => ({
        ...prev,
        [newWidgetId]: newGroups,
      }));

      store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
        ...prev,
        [newWidgetId]: newUngroupedFields,
      }));

      store.set(fieldsWidgetEditorModeDraftState, (prev) => ({
        ...prev,
        [newWidgetId]: newEditorMode,
      }));

      return { newViewId: copyResult.newViewId };
    },
    [
      cloneView,
      fieldsWidgetEditorModeDraftState,
      fieldsWidgetGroupsDraftState,
      fieldsWidgetUngroupedFieldsDraftState,
      pageLayoutDraftState,
      store,
    ],
  );

  return { duplicateFieldsWidget };
};
