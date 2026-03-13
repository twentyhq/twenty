import {
  getDefaultRecordLayoutDraftEntry,
  recordLayoutDraftStoreByPageLayoutIdState,
} from '@/app/states/recordLayoutDraftStoreByPageLayoutIdState';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { atom } from 'jotai';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

const FIELDS_WIDGET_EDITOR_MODE_DRAFT_COMPONENT_STATE_KEY =
  'fieldsWidgetEditorModeDraftComponentState';

globalComponentInstanceContextMap.set(
  FIELDS_WIDGET_EDITOR_MODE_DRAFT_COMPONENT_STATE_KEY,
  PageLayoutComponentInstanceContext,
);

const defaultRecordLayoutDraftEntry = getDefaultRecordLayoutDraftEntry();
const DEFAULT_FIELDS_WIDGET_EDITOR_MODE_DRAFT =
  defaultRecordLayoutDraftEntry.fieldsWidgetEditorModeDraft;

type SetStateAction<StateType> =
  | StateType
  | ((prevState: StateType) => StateType);

const fieldsWidgetEditorModeDraftAtomCache = new Map<
  string,
  ReturnType<
    ComponentState<Record<string, FieldsWidgetEditorMode>>['atomFamily']
  >
>();

const fieldsWidgetEditorModeDraftFamilyFunction = ({
  instanceId,
}: ComponentStateKey): ReturnType<
  ComponentState<Record<string, FieldsWidgetEditorMode>>['atomFamily']
> => {
  const existingAtom = fieldsWidgetEditorModeDraftAtomCache.get(instanceId);

  if (existingAtom !== undefined) {
    return existingAtom;
  }

  const baseAtom = atom(
    (get) =>
      get(recordLayoutDraftStoreByPageLayoutIdState.atom)[instanceId]
        ?.fieldsWidgetEditorModeDraft ??
      DEFAULT_FIELDS_WIDGET_EDITOR_MODE_DRAFT,
    (
      get,
      set,
      update: SetStateAction<Record<string, FieldsWidgetEditorMode>>,
    ) => {
      const recordLayoutDraftStoreByPageLayoutId = get(
        recordLayoutDraftStoreByPageLayoutIdState.atom,
      );

      const currentEntry =
        recordLayoutDraftStoreByPageLayoutId[instanceId] ??
        getDefaultRecordLayoutDraftEntry();

      const nextFieldsWidgetEditorModeDraft =
        typeof update === 'function'
          ? update(currentEntry.fieldsWidgetEditorModeDraft)
          : update;

      set(recordLayoutDraftStoreByPageLayoutIdState.atom, {
        ...recordLayoutDraftStoreByPageLayoutId,
        [instanceId]: {
          ...currentEntry,
          fieldsWidgetEditorModeDraft: nextFieldsWidgetEditorModeDraft,
        },
      });
    },
  );

  baseAtom.debugLabel = `${FIELDS_WIDGET_EDITOR_MODE_DRAFT_COMPONENT_STATE_KEY}__${instanceId}`;

  fieldsWidgetEditorModeDraftAtomCache.set(instanceId, baseAtom);

  return baseAtom;
};

export const fieldsWidgetEditorModeDraftComponentState: ComponentState<
  Record<string, FieldsWidgetEditorMode>
> = {
  type: 'ComponentState',
  key: FIELDS_WIDGET_EDITOR_MODE_DRAFT_COMPONENT_STATE_KEY,
  atomFamily: fieldsWidgetEditorModeDraftFamilyFunction,
};
