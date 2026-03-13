import {
  getDefaultRecordLayoutDraftEntry,
  recordLayoutDraftStoreByPageLayoutIdState,
} from '@/app/states/recordLayoutDraftStoreByPageLayoutIdState';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { atom } from 'jotai';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

const FIELDS_WIDGET_UNGROUPED_FIELDS_DRAFT_COMPONENT_STATE_KEY =
  'fieldsWidgetUngroupedFieldsDraftComponentState';

globalComponentInstanceContextMap.set(
  FIELDS_WIDGET_UNGROUPED_FIELDS_DRAFT_COMPONENT_STATE_KEY,
  PageLayoutComponentInstanceContext,
);

const defaultRecordLayoutDraftEntry = getDefaultRecordLayoutDraftEntry();
const DEFAULT_FIELDS_WIDGET_UNGROUPED_FIELDS_DRAFT =
  defaultRecordLayoutDraftEntry.fieldsWidgetUngroupedFieldsDraft;

type SetStateAction<StateType> =
  | StateType
  | ((prevState: StateType) => StateType);

const fieldsWidgetUngroupedFieldsDraftAtomCache = new Map<
  string,
  ReturnType<
    ComponentState<Record<string, FieldsWidgetGroupField[]>>['atomFamily']
  >
>();

const fieldsWidgetUngroupedFieldsDraftFamilyFunction = ({
  instanceId,
}: ComponentStateKey): ReturnType<
  ComponentState<Record<string, FieldsWidgetGroupField[]>>['atomFamily']
> => {
  const existingAtom =
    fieldsWidgetUngroupedFieldsDraftAtomCache.get(instanceId);

  if (existingAtom !== undefined) {
    return existingAtom;
  }

  const baseAtom = atom(
    (get) =>
      get(recordLayoutDraftStoreByPageLayoutIdState.atom)[instanceId]
        ?.fieldsWidgetUngroupedFieldsDraft ??
      DEFAULT_FIELDS_WIDGET_UNGROUPED_FIELDS_DRAFT,
    (
      get,
      set,
      update: SetStateAction<Record<string, FieldsWidgetGroupField[]>>,
    ) => {
      const recordLayoutDraftStoreByPageLayoutId = get(
        recordLayoutDraftStoreByPageLayoutIdState.atom,
      );

      const currentEntry =
        recordLayoutDraftStoreByPageLayoutId[instanceId] ??
        getDefaultRecordLayoutDraftEntry();

      const nextFieldsWidgetUngroupedFieldsDraft =
        typeof update === 'function'
          ? update(currentEntry.fieldsWidgetUngroupedFieldsDraft)
          : update;

      set(recordLayoutDraftStoreByPageLayoutIdState.atom, {
        ...recordLayoutDraftStoreByPageLayoutId,
        [instanceId]: {
          ...currentEntry,
          fieldsWidgetUngroupedFieldsDraft:
            nextFieldsWidgetUngroupedFieldsDraft,
        },
      });
    },
  );

  baseAtom.debugLabel = `${FIELDS_WIDGET_UNGROUPED_FIELDS_DRAFT_COMPONENT_STATE_KEY}__${instanceId}`;

  fieldsWidgetUngroupedFieldsDraftAtomCache.set(instanceId, baseAtom);

  return baseAtom;
};

export const fieldsWidgetUngroupedFieldsDraftComponentState: ComponentState<
  Record<string, FieldsWidgetGroupField[]>
> = {
  type: 'ComponentState',
  key: FIELDS_WIDGET_UNGROUPED_FIELDS_DRAFT_COMPONENT_STATE_KEY,
  atomFamily: fieldsWidgetUngroupedFieldsDraftFamilyFunction,
};
