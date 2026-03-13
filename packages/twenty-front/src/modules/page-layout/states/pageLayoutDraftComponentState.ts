import {
  getDefaultRecordLayoutDraftEntry,
  recordLayoutDraftStoreByPageLayoutIdState,
} from '@/app/states/recordLayoutDraftStoreByPageLayoutIdState';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { atom } from 'jotai';

import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

const PAGE_LAYOUT_DRAFT_COMPONENT_STATE_KEY = 'pageLayoutDraftComponentState';

globalComponentInstanceContextMap.set(
  PAGE_LAYOUT_DRAFT_COMPONENT_STATE_KEY,
  PageLayoutComponentInstanceContext,
);

const defaultRecordLayoutDraftEntry = getDefaultRecordLayoutDraftEntry();
const DEFAULT_PAGE_LAYOUT_DRAFT = defaultRecordLayoutDraftEntry.pageLayoutDraft;

type SetStateAction<StateType> =
  | StateType
  | ((prevState: StateType) => StateType);

const pageLayoutDraftAtomCache = new Map<
  string,
  ReturnType<ComponentState<DraftPageLayout>['atomFamily']>
>();

const pageLayoutDraftFamilyFunction = ({
  instanceId,
}: ComponentStateKey): ReturnType<
  ComponentState<DraftPageLayout>['atomFamily']
> => {
  const existingAtom = pageLayoutDraftAtomCache.get(instanceId);

  if (existingAtom !== undefined) {
    return existingAtom;
  }

  const baseAtom = atom(
    (get) =>
      get(recordLayoutDraftStoreByPageLayoutIdState.atom)[instanceId]
        ?.pageLayoutDraft ?? DEFAULT_PAGE_LAYOUT_DRAFT,
    (get, set, update: SetStateAction<DraftPageLayout>) => {
      const recordLayoutDraftStoreByPageLayoutId = get(
        recordLayoutDraftStoreByPageLayoutIdState.atom,
      );

      const currentEntry =
        recordLayoutDraftStoreByPageLayoutId[instanceId] ??
        getDefaultRecordLayoutDraftEntry();

      const nextPageLayoutDraft =
        typeof update === 'function'
          ? update(currentEntry.pageLayoutDraft)
          : update;

      set(recordLayoutDraftStoreByPageLayoutIdState.atom, {
        ...recordLayoutDraftStoreByPageLayoutId,
        [instanceId]: {
          ...currentEntry,
          pageLayoutDraft: nextPageLayoutDraft,
        },
      });
    },
  );

  baseAtom.debugLabel = `${PAGE_LAYOUT_DRAFT_COMPONENT_STATE_KEY}__${instanceId}`;

  pageLayoutDraftAtomCache.set(instanceId, baseAtom);

  return baseAtom;
};

export const pageLayoutDraftComponentState: ComponentState<DraftPageLayout> = {
  type: 'ComponentState',
  key: PAGE_LAYOUT_DRAFT_COMPONENT_STATE_KEY,
  atomFamily: pageLayoutDraftFamilyFunction,
};
