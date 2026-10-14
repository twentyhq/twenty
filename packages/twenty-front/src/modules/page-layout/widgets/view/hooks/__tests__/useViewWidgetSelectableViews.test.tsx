import { useViewWidgetSelectableViews } from '@/page-layout/widgets/view/hooks/useViewWidgetSelectableViews';
import { type View } from '@/views/types/View';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { ViewType, ViewVisibility } from '~/generated-metadata/graphql';

const OBJECT_METADATA_ID = 'object-metadata-id';

const makeView = (id: string, overrides: Partial<View> = {}): View =>
  ({
    id,
    name: id,
    objectMetadataId: OBJECT_METADATA_ID,
    type: ViewType.TABLE,
    visibility: ViewVisibility.WORKSPACE,
    position: 0,
    ...overrides,
  }) as View;

jest.mock('@/views/states/selectors/viewsSelector', () => {
  const { atom } = jest.requireActual('jotai');

  return {
    viewsSelector: {
      type: 'Selector',
      key: 'viewsSelectorTestMock',
      atom: atom(() => [
        makeView('shared-table'),
        makeView('shared-kanban', { type: ViewType.KANBAN }),
        makeView('personal', { visibility: ViewVisibility.UNLISTED }),
        makeView('widget-owned', { type: ViewType.TABLE_WIDGET }),
        makeView('other-object', { objectMetadataId: 'other-object-id' }),
      ]),
    },
  };
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore()}>{children}</Provider>
);

describe('useViewWidgetSelectableViews', () => {
  it('only offers workspace views of the object that are not owned by a widget', () => {
    const { result } = renderHook(
      () => useViewWidgetSelectableViews(OBJECT_METADATA_ID),
      { wrapper },
    );

    expect(result.current.selectableViews.map((view) => view.id)).toEqual([
      'shared-table',
      'shared-kanban',
    ]);
  });
});
