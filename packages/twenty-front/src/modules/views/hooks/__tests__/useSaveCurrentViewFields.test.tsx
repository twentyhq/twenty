import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useSaveCurrentViewFields } from '@/views/hooks/useSaveCurrentViewFields';
import { type ViewField } from '@/views/types/ViewField';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
  type ViewFieldRelationScope,
  ViewSortDirection,
} from 'twenty-shared/types';

const performViewFieldApiCreateMock = jest.fn();
const performViewFieldApiUpdateMock = jest.fn();

jest.mock('@/views/hooks/internal/usePerformViewFieldApiPersist', () => ({
  usePerformViewFieldApiPersist: () => ({
    performViewFieldApiCreate: performViewFieldApiCreateMock,
    performViewFieldApiUpdate: performViewFieldApiUpdateMock,
  }),
}));

jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => ({ canPersistChanges: true }),
}));

const VIEW_ID = 'view-id';

const RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [],
  filterGroups: [],
  sorts: [
    {
      fieldMetadataId: 'job-title-field',
      direction: ViewSortDirection.ASC,
      subFieldName: null,
      relationTargetFieldMetadataId: null,
    },
  ],
  limit: 2,
};

const scopedViewField: Omit<ViewField, 'definition'> = {
  id: 'scoped-view-field',
  fieldMetadataId: 'people-field',
  position: 4,
  isVisible: true,
  isCanonical: false,
  isActive: true,
  size: 240,
  aggregateOperation: null,
  relationScope: RELATION_SCOPE,
};

const mockGetViewFromState = jest.fn();

jest.mock('@/views/hooks/useGetViewFromState', () => ({
  useGetViewFromState: () => ({ getViewFromState: mockGetViewFromState }),
}));

const CONTEXT_STORE_INSTANCE_ID = 'context-store-instance-id';

const saveViewFields = (viewFields: Omit<ViewField, 'definition'>[]) => {
  const store = createStore();
  store.set(
    contextStoreCurrentViewIdComponentState.atomFamily({
      instanceId: CONTEXT_STORE_INSTANCE_ID,
    }),
    VIEW_ID,
  );

  const { result } = renderHook(() => useSaveCurrentViewFields(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: CONTEXT_STORE_INSTANCE_ID }}
        >
          {children}
        </ContextStoreComponentInstanceContext.Provider>
      </JotaiProvider>
    ),
  });

  return act(() => result.current.saveViewFields(viewFields));
};

describe('useSaveCurrentViewFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performViewFieldApiCreateMock.mockResolvedValue({ status: 'successful' });
    performViewFieldApiUpdateMock.mockResolvedValue({ status: 'successful' });
    mockGetViewFromState.mockReturnValue({
      id: VIEW_ID,
      viewFields: [scopedViewField],
    });
  });

  it('creates a view field that is not in the view yet, with its relation scope', async () => {
    const isSaved = await saveViewFields([
      { ...scopedViewField, id: 'new-view-field' },
    ]);

    expect(isSaved).toBe(true);
    expect(performViewFieldApiCreateMock).toHaveBeenCalledWith({
      inputs: [
        expect.objectContaining({
          id: 'new-view-field',
          viewId: VIEW_ID,
          isCanonical: false,
          relationScope: RELATION_SCOPE,
        }),
      ],
    });
    expect(performViewFieldApiUpdateMock).toHaveBeenCalledWith([]);
  });

  it('sends a changed relation scope with the update', async () => {
    const changedRelationScope = { ...RELATION_SCOPE, limit: 5 };

    await saveViewFields([
      { ...scopedViewField, relationScope: changedRelationScope },
    ]);

    expect(performViewFieldApiUpdateMock).toHaveBeenCalledWith([
      {
        input: {
          id: scopedViewField.id,
          update: {
            aggregateOperation: null,
            isVisible: true,
            position: 4,
            size: 240,
            relationScope: changedRelationScope,
          },
        },
      },
    ]);
  });

  it('sends a changed related record field with the update, null to show the records again', async () => {
    await saveViewFields([
      { ...scopedViewField, relationTargetFieldMetadataId: 'emails-field' },
    ]);

    expect(performViewFieldApiUpdateMock).toHaveBeenLastCalledWith([
      {
        input: {
          id: scopedViewField.id,
          update: {
            aggregateOperation: null,
            isVisible: true,
            position: 4,
            size: 240,
            relationTargetFieldMetadataId: 'emails-field',
          },
        },
      },
    ]);

    mockGetViewFromState.mockReturnValue({
      id: VIEW_ID,
      viewFields: [
        { ...scopedViewField, relationTargetFieldMetadataId: 'emails-field' },
      ],
    });

    await saveViewFields([scopedViewField]);

    expect(performViewFieldApiUpdateMock).toHaveBeenLastCalledWith([
      {
        input: {
          id: scopedViewField.id,
          update: expect.objectContaining({
            relationTargetFieldMetadataId: null,
          }),
        },
      },
    ]);
  });

  it('leaves an unchanged related record field out of the update', async () => {
    mockGetViewFromState.mockReturnValue({
      id: VIEW_ID,
      viewFields: [
        { ...scopedViewField, relationTargetFieldMetadataId: 'emails-field' },
      ],
    });

    await saveViewFields([
      {
        ...scopedViewField,
        relationTargetFieldMetadataId: 'emails-field',
        size: 300,
      },
    ]);

    expect(performViewFieldApiUpdateMock).toHaveBeenCalledWith([
      {
        input: {
          id: scopedViewField.id,
          update: {
            aggregateOperation: null,
            isVisible: true,
            position: 4,
            size: 300,
          },
        },
      },
    ]);
  });

  it('sends a changed label with the update, null to show the default label again', async () => {
    await saveViewFields([{ ...scopedViewField, label: 'Main contacts' }]);

    expect(performViewFieldApiUpdateMock).toHaveBeenLastCalledWith([
      {
        input: {
          id: scopedViewField.id,
          update: expect.objectContaining({ label: 'Main contacts' }),
        },
      },
    ]);

    mockGetViewFromState.mockReturnValue({
      id: VIEW_ID,
      viewFields: [{ ...scopedViewField, label: 'Main contacts' }],
    });

    await saveViewFields([{ ...scopedViewField, label: null }]);

    expect(performViewFieldApiUpdateMock).toHaveBeenLastCalledWith([
      {
        input: {
          id: scopedViewField.id,
          update: expect.objectContaining({ label: null }),
        },
      },
    ]);
  });

  it('leaves an unchanged label out of the update', async () => {
    mockGetViewFromState.mockReturnValue({
      id: VIEW_ID,
      viewFields: [{ ...scopedViewField, label: 'Main contacts' }],
    });

    await saveViewFields([
      { ...scopedViewField, label: 'Main contacts', size: 300 },
    ]);

    expect(performViewFieldApiUpdateMock).toHaveBeenCalledWith([
      {
        input: {
          id: scopedViewField.id,
          update: {
            aggregateOperation: null,
            isVisible: true,
            position: 4,
            size: 300,
          },
        },
      },
    ]);
  });

  it('leaves an unchanged relation scope out of the update', async () => {
    await saveViewFields([{ ...scopedViewField, size: 300 }]);

    expect(performViewFieldApiUpdateMock).toHaveBeenCalledWith([
      {
        input: {
          id: scopedViewField.id,
          update: {
            aggregateOperation: null,
            isVisible: true,
            position: 4,
            size: 300,
          },
        },
      },
    ]);
  });

  it('sends no update when nothing changed', async () => {
    const isSaved = await saveViewFields([scopedViewField]);

    expect(isSaved).toBe(true);
    expect(performViewFieldApiUpdateMock).toHaveBeenCalledWith([]);
  });

  it('reports a failed save', async () => {
    performViewFieldApiCreateMock.mockResolvedValue({ status: 'failed' });

    const isSaved = await saveViewFields([
      { ...scopedViewField, id: 'new-view-field' },
    ]);

    expect(isSaved).toBe(false);
  });
});
