import {
  getDefaultRecordLayoutDraftEntry,
  recordLayoutDraftStoreByPageLayoutIdState,
} from '@/app/states/recordLayoutDraftStoreByPageLayoutIdState';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { atom } from 'jotai';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

const FIELDS_WIDGET_GROUPS_DRAFT_COMPONENT_STATE_KEY =
  'fieldsWidgetGroupsDraftComponentState';

globalComponentInstanceContextMap.set(
  FIELDS_WIDGET_GROUPS_DRAFT_COMPONENT_STATE_KEY,
  PageLayoutComponentInstanceContext,
);

const defaultRecordLayoutDraftEntry = getDefaultRecordLayoutDraftEntry();
const DEFAULT_FIELDS_WIDGET_GROUPS_DRAFT =
  defaultRecordLayoutDraftEntry.fieldsWidgetGroupsDraft;

type SetStateAction<StateType> =
  | StateType
  | ((prevState: StateType) => StateType);

const fieldsWidgetGroupsDraftAtomCache = new Map<
  string,
  ReturnType<ComponentState<Record<string, FieldsWidgetGroup[]>>['atomFamily']>
>();

const fieldsWidgetGroupsDraftFamilyFunction = ({
  instanceId,
}: ComponentStateKey): ReturnType<
  ComponentState<Record<string, FieldsWidgetGroup[]>>['atomFamily']
> => {
  const existingAtom = fieldsWidgetGroupsDraftAtomCache.get(instanceId);

  if (existingAtom !== undefined) {
    return existingAtom;
  }

  const baseAtom = atom(
    (get) =>
      get(recordLayoutDraftStoreByPageLayoutIdState.atom)[instanceId]
        ?.fieldsWidgetGroupsDraft ?? DEFAULT_FIELDS_WIDGET_GROUPS_DRAFT,
    (get, set, update: SetStateAction<Record<string, FieldsWidgetGroup[]>>) => {
      const recordLayoutDraftStoreByPageLayoutId = get(
        recordLayoutDraftStoreByPageLayoutIdState.atom,
      );

      const currentEntry =
        recordLayoutDraftStoreByPageLayoutId[instanceId] ??
        getDefaultRecordLayoutDraftEntry();

      const nextFieldsWidgetGroupsDraft =
        typeof update === 'function'
          ? update(currentEntry.fieldsWidgetGroupsDraft)
          : update;

      set(recordLayoutDraftStoreByPageLayoutIdState.atom, {
        ...recordLayoutDraftStoreByPageLayoutId,
        [instanceId]: {
          ...currentEntry,
          fieldsWidgetGroupsDraft: nextFieldsWidgetGroupsDraft,
        },
      });
    },
  );

  baseAtom.debugLabel = `${FIELDS_WIDGET_GROUPS_DRAFT_COMPONENT_STATE_KEY}__${instanceId}`;

  fieldsWidgetGroupsDraftAtomCache.set(instanceId, baseAtom);

  return baseAtom;
};

export const fieldsWidgetGroupsDraftComponentState: ComponentState<
  Record<string, FieldsWidgetGroup[]>
> = {
  type: 'ComponentState',
  key: FIELDS_WIDGET_GROUPS_DRAFT_COMPONENT_STATE_KEY,
  atomFamily: fieldsWidgetGroupsDraftFamilyFunction,
};
