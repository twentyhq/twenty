import { gql } from '@apollo/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { RecordViewsLoadEffect } from '@/side-panel/pages/record-views/components/RecordViewsLoadEffect';
import { useRecordViews } from '@/side-panel/pages/record-views/hooks/useRecordViews';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { type View } from '@/views/types/View';
import { ViewFilterOperand } from 'twenty-shared/types';
import { ViewType, ViewVisibility } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const mockQuery = jest.fn();
const mockClient = { query: mockQuery };
const mockDocument = gql`
  query Test {
    __typename
  }
`;
const mockDependencies = { timeZone: 'Europe/Paris' };
let mockCanRead = true;
const baseView: View = {
  id: 'all',
  name: 'All',
  type: ViewType.TABLE,
  objectMetadataId: objectMetadataItem.id,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  shouldHideEmptyGroups: false,
  position: 0,
  icon: 'IconTable',
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
};
let mockViews: View[] = [];

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem }),
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockClient,
}));
jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: () => ({ findManyRecordsQuery: mockDocument }),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => ({ canReadObjectRecords: mockCanRead }),
}));
jest.mock(
  '@/object-record/record-filter/hooks/useFilterValueDependencies',
  () => ({
    useFilterValueDependencies: () => ({
      filterValueDependencies: mockDependencies,
    }),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({ useAtomFamilySelectorValue: () => mockViews }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => objectMetadataItem.fields,
}));

const response = (recordId?: string) => ({
  data: { companies: { edges: recordId ? [{ node: { id: recordId } }] : [] } },
});

const RecordViewsProbe = () => {
  const { views, loading, error, retry } = useRecordViews();

  return (
    <>
      <output aria-label="Matching views">
        {views.map((view) => view.id).join(',')}
      </output>
      <output aria-label="Loading">{String(loading)}</output>
      <output aria-label="Error">{String(error)}</output>
      <button onClick={retry}>Retry</button>
    </>
  );
};

const renderEffect = (recordId = 'record-1') =>
  render(
    <Provider store={createStore()}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: 'record-views-page' }}
      >
        <RecordViewsLoadEffect
          objectNameSingular="company"
          recordId={recordId}
        />
        <RecordViewsProbe />
      </SidePanelPageComponentInstanceContext.Provider>
    </Provider>,
  );

const matchingViews = () => screen.getByLabelText('Matching views').textContent;
const isLoading = () => screen.getByLabelText('Loading').textContent;
const hasError = () => screen.getByLabelText('Error').textContent;

describe('RecordViewsLoadEffect', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockCanRead = true;
    mockViews = [baseView, { ...baseView, id: 'filtered' }];
  });

  it('returns only confirmed matches in view order', async () => {
    mockQuery
      .mockResolvedValueOnce(response('record-1'))
      .mockResolvedValueOnce(response());

    renderEffect();

    await waitFor(() => expect(isLoading()).toBe('false'));
    expect(matchingViews()).toBe('all');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: 'no-cache',
        variables: { filter: { id: { eq: 'record-1' } }, limit: 1 },
      }),
    );
  });

  it('does not query without read permission', async () => {
    mockCanRead = false;

    renderEffect();

    await waitFor(() => expect(isLoading()).toBe('false'));
    expect(matchingViews()).toBe('');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('skips a view whose filters cannot be resolved without dropping the others', async () => {
    mockViews = [
      baseView,
      {
        ...baseView,
        id: 'unresolvable',
        viewFilters: [
          {
            id: 'missing',
            fieldMetadataId: 'unavailable-field',
            operand: ViewFilterOperand.CONTAINS,
            value: 'Acme',
          },
        ],
      },
    ];
    mockQuery.mockResolvedValue(response('record-1'));

    renderEffect();

    await waitFor(() => expect(isLoading()).toBe('false'));
    expect(matchingViews()).toBe('all');
    expect(hasError()).toBe('false');
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('shows errors separately from an empty result and supports retry', async () => {
    const user = userEvent.setup();
    mockQuery.mockRejectedValue(new Error('Network unavailable'));

    renderEffect();

    await waitFor(() => expect(hasError()).toBe('true'));
    expect(matchingViews()).toBe('');

    mockQuery.mockResolvedValue(response('record-1'));
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(matchingViews()).toBe('all,filtered'));
    expect(hasError()).toBe('false');
  });

  it('ignores stale responses after the target record changes', async () => {
    let resolveOldRequest: (
      value: ReturnType<typeof response>,
    ) => void = () => {};
    const oldRequest = new Promise<ReturnType<typeof response>>((resolve) => {
      resolveOldRequest = resolve;
    });
    mockQuery.mockReturnValue(oldRequest);

    const { rerender } = renderEffect();

    mockQuery.mockResolvedValue(response());
    rerender(
      <Provider store={createStore()}>
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: 'record-views-page' }}
        >
          <RecordViewsLoadEffect
            objectNameSingular="company"
            recordId="record-2"
          />
          <RecordViewsProbe />
        </SidePanelPageComponentInstanceContext.Provider>
      </Provider>,
    );

    await waitFor(() => expect(isLoading()).toBe('false'));
    await act(async () => {
      resolveOldRequest(response('record-1'));
    });

    expect(matchingViews()).toBe('');
  });

  it('limits simultaneous checks for many views', async () => {
    mockViews = Array.from({ length: 12 }, (_, index) => ({
      ...baseView,
      id: `view-${index}`,
    }));
    let release: (value: ReturnType<typeof response>) => void = () => {};
    const pending = new Promise<ReturnType<typeof response>>((resolve) => {
      release = resolve;
    });
    mockQuery.mockReturnValue(pending);

    renderEffect();

    expect(mockQuery).toHaveBeenCalledTimes(5);

    mockQuery.mockResolvedValue(response('record-1'));
    await act(async () => {
      release(response('record-1'));
    });

    await waitFor(() =>
      expect(matchingViews()?.split(',')).toHaveLength(12),
    );
  });
});
