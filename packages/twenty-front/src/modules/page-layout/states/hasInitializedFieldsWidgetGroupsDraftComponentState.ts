import {
  getDefaultRecordLayoutDraftEntry,
  recordLayoutDraftStoreByPageLayoutIdState,
} from '@/app/states/recordLayoutDraftStoreByPageLayoutIdState';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { atom } from 'jotai';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

const HAS_INITIALIZED_FIELDS_WIDGET_GROUPS_DRAFT_COMPONENT_STATE_KEY =
  'hasInitializedFieldsWidgetGroupsDraftComponentState';

globalComponentInstanceContextMap.set(
  HAS_INITIALIZED_FIELDS_WIDGET_GROUPS_DRAFT_COMPONENT_STATE_KEY,
  PageLayoutComponentInstanceContext,
);

const defaultRecordLayoutDraftEntry = getDefaultRecordLayoutDraftEntry();
const DEFAULT_HAS_INITIALIZED_FIELDS_WIDGET_GROUPS_DRAFT =
  defaultRecordLayoutDraftEntry.hasInitializedFieldsWidgetGroupsDraft;

type SetStateAction<StateType> =
  | StateType
  | ((prevState: StateType) => StateType);

const hasInitializedFieldsWidgetGroupsDraftAtomCache = new Map<
  string,
  ReturnType<ComponentState<Record<string, boolean>>['atomFamily']>
>();

const hasInitializedFieldsWidgetGroupsDraftFamilyFunction = ({
  instanceId,
}: ComponentStateKey): ReturnType<
  ComponentState<Record<string, boolean>>['atomFamily']
> => {
  const existingAtom =
    hasInitializedFieldsWidgetGroupsDraftAtomCache.get(instanceId);

  if (existingAtom !== undefined) {
    return existingAtom;
  }

  const baseAtom = atom(
    (get) =>
      get(recordLayoutDraftStoreByPageLayoutIdState.atom)[instanceId]
        ?.hasInitializedFieldsWidgetGroupsDraft ??
      DEFAULT_HAS_INITIALIZED_FIELDS_WIDGET_GROUPS_DRAFT,
    (get, set, update: SetStateAction<Record<string, boolean>>) => {
      const recordLayoutDraftStoreByPageLayoutId = get(
        recordLayoutDraftStoreByPageLayoutIdState.atom,
      );

      const currentEntry =
        recordLayoutDraftStoreByPageLayoutId[instanceId] ??
        getDefaultRecordLayoutDraftEntry();

      const nextHasInitializedFieldsWidgetGroupsDraft =
        typeof update === 'function'
          ? update(currentEntry.hasInitializedFieldsWidgetGroupsDraft)
          : update;

      set(recordLayoutDraftStoreByPageLayoutIdState.atom, {
        ...recordLayoutDraftStoreByPageLayoutId,
        [instanceId]: {
          ...currentEntry,
          hasInitializedFieldsWidgetGroupsDraft:
            nextHasInitializedFieldsWidgetGroupsDraft,
        },
      });
    },
  );

  baseAtom.debugLabel = `${HAS_INITIALIZED_FIELDS_WIDGET_GROUPS_DRAFT_COMPONENT_STATE_KEY}__${instanceId}`;

  hasInitializedFieldsWidgetGroupsDraftAtomCache.set(instanceId, baseAtom);

  return baseAtom;
};

export const hasInitializedFieldsWidgetGroupsDraftComponentState: ComponentState<
  Record<string, boolean>
> = {
  type: 'ComponentState',
  key: HAS_INITIALIZED_FIELDS_WIDGET_GROUPS_DRAFT_COMPONENT_STATE_KEY,
  atomFamily: hasInitializedFieldsWidgetGroupsDraftFamilyFunction,
};
