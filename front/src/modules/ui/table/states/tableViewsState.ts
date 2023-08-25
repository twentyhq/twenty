import { atom, atomFamily, selectorFamily } from 'recoil';

export type TableView = { id: string; name: string };

export const tableViewsState = atomFamily<TableView[], string>({
  key: 'tableViewsState',
  default: [],
});

export const tableViewsByIdState = selectorFamily<
  Record<string, TableView>,
  string
>({
  key: 'tableViewsByIdState',
  get:
    (scopeId) =>
    ({ get }) =>
      get(tableViewsState(scopeId)).reduce<Record<string, TableView>>(
        (result, view) => ({ ...result, [view.id]: view }),
        {},
      ),
});

export const currentTableViewIdState = atomFamily<string | undefined, string>({
  key: 'currentTableViewIdState',
  default: undefined,
});

export const currentTableViewState = selectorFamily<
  TableView | undefined,
  string
>({
  key: 'currentTableViewState',
  get:
    (scopeId) =>
    ({ get }) => {
      const currentViewId = get(currentTableViewIdState(scopeId));
      return currentViewId
        ? get(tableViewsByIdState(scopeId))[currentViewId]
        : undefined;
    },
});

export const tableViewEditModeState = atom<{
  mode: 'create' | 'edit' | undefined;
  viewId: string | undefined;
}>({
  key: 'tableViewEditModeState',
  default: { mode: undefined, viewId: undefined },
});
