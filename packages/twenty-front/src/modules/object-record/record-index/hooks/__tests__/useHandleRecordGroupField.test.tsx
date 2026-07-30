import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useHandleRecordGroupField } from '@/object-record/record-index/hooks/useHandleRecordGroupField';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type View } from '@/views/types/View';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const CONTEXT_STORE_INSTANCE_ID = 'test-context-store';
const VIEW_ID = 'test-view-id';
const COMPANY_FIELD_METADATA_ID = 'company-field-metadata-id';

const objectMetadataItem = {
  id: 'person-object-metadata-id',
  namePlural: 'people',
  fields: [],
};

let view: View | undefined;

const performViewAPIUpdate = jest.fn();
const loadRecordIndexStates = jest.fn();

jest.mock(
  '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow',
  () => ({
    useContextStoreObjectMetadataItemOrThrow: () => ({
      objectMetadataItem,
    }),
  }),
);

jest.mock('@/views/hooks/useGetViewFromState', () => ({
  useGetViewFromState: () => ({
    getViewFromState: () => view,
  }),
}));

jest.mock('@/views/hooks/internal/usePerformViewAPIUpdate', () => ({
  usePerformViewAPIUpdate: () => ({
    performViewAPIUpdate: (...args: unknown[]) => performViewAPIUpdate(...args),
  }),
}));

jest.mock(
  '@/object-record/record-index/hooks/useLoadRecordIndexStates',
  () => ({
    useLoadRecordIndexStates: () => ({
      loadRecordIndexStates: (...args: unknown[]) =>
        loadRecordIndexStates(...args),
    }),
  }),
);

const companyRelationFieldMetadataItem = {
  id: COMPANY_FIELD_METADATA_ID,
  type: FieldMetadataType.RELATION,
  isNullable: true,
  relation: { type: RelationType.MANY_TO_ONE },
} as unknown as FieldMetadataItem;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: CONTEXT_STORE_INSTANCE_ID }}
    >
      {children}
    </ContextStoreComponentInstanceContext.Provider>
  </JotaiProvider>
);

const buildView = (viewOverrides: Partial<View>): View =>
  ({
    id: VIEW_ID,
    mainGroupByFieldMetadataId: null,
    viewGroups: [],
    ...viewOverrides,
  }) as View;

const buildSuccessfulUpdateResult = (updatedView: Partial<View>) => ({
  status: 'successful',
  response: { data: { updateView: updatedView } },
});

describe('useHandleRecordGroupField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore.set(
      contextStoreCurrentViewIdComponentState.atomFamily({
        instanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
      VIEW_ID,
    );
  });

  it('should persist the grouping field and load the view groups returned by the server', async () => {
    view = buildView({});

    const updatedView = {
      id: VIEW_ID,
      mainGroupByFieldMetadataId: COMPANY_FIELD_METADATA_ID,
      viewGroups: [
        {
          id: 'server-view-group-id',
          fieldValue: '',
          isVisible: true,
          position: 0,
        },
      ],
    };

    performViewAPIUpdate.mockResolvedValue(
      buildSuccessfulUpdateResult(updatedView as unknown as View),
    );

    const { result } = renderHook(() => useHandleRecordGroupField(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.handleRecordGroupFieldChange(
        companyRelationFieldMetadataItem,
      );
    });

    expect(performViewAPIUpdate).toHaveBeenCalledWith({
      id: VIEW_ID,
      input: { mainGroupByFieldMetadataId: COMPANY_FIELD_METADATA_ID },
    });
    expect(loadRecordIndexStates).toHaveBeenCalledWith(
      updatedView,
      objectMetadataItem,
    );
  });

  it('should remove the grouping when the view has no persisted view group', async () => {
    view = buildView({
      mainGroupByFieldMetadataId: COMPANY_FIELD_METADATA_ID,
      viewGroups: [],
    });

    const updatedView = {
      id: VIEW_ID,
      mainGroupByFieldMetadataId: null,
      viewGroups: [],
    };

    performViewAPIUpdate.mockResolvedValue(
      buildSuccessfulUpdateResult(updatedView as unknown as View),
    );

    const { result } = renderHook(() => useHandleRecordGroupField(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.resetRecordGroupField();
    });

    expect(performViewAPIUpdate).toHaveBeenCalledWith({
      id: VIEW_ID,
      input: { mainGroupByFieldMetadataId: null },
    });
    expect(loadRecordIndexStates).toHaveBeenCalledWith(
      updatedView,
      objectMetadataItem,
    );
  });

  it('should not update the view when it is not grouped', async () => {
    view = buildView({});

    const { result } = renderHook(() => useHandleRecordGroupField(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.resetRecordGroupField();
    });

    expect(performViewAPIUpdate).not.toHaveBeenCalled();
  });
});
