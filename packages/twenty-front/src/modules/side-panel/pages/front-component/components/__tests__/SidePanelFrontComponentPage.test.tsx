import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { SidePanelFrontComponentPage } from '@/side-panel/pages/front-component/components/SidePanelFrontComponentPage';
import { viewableFrontComponentIdComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentIdComponentState';
import { viewableFrontComponentRecordContextComponentState } from '@/side-panel/pages/front-component/states/viewableFrontComponentRecordContextComponentState';
import { type FrontComponentRecordContext } from '@/side-panel/pages/front-component/types/FrontComponentRecordContext';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

jest.mock('@/front-components/components/FrontComponentRenderer', () => ({
  FrontComponentRenderer: ({
    frontComponentId,
    selectedRecordIds,
    selectedRecordsFilter,
    objectNameSingular,
  }: {
    frontComponentId: string;
    selectedRecordIds?: string[];
    selectedRecordsFilter?: RecordGqlOperationFilter | null;
    objectNameSingular?: string;
  }) => (
    <div data-testid="front-component">
      {`${frontComponentId}:${objectNameSingular ?? 'no object'}:${selectedRecordIds?.join(',') ?? 'no records'}:${JSON.stringify(selectedRecordsFilter) ?? 'no filter'}`}
    </div>
  ),
}));

jest.mock('@/front-components/components/FrontComponentSkeletonLoader', () => ({
  FrontComponentSkeletonLoader: () => <div data-testid="skeleton" />,
}));

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';

const renderSidePanelFrontComponentPage = (
  recordContext: FrontComponentRecordContext | null,
) => {
  const store = createStore();

  store.set(
    viewableFrontComponentIdComponentState.atomFamily({
      instanceId: PAGE_INSTANCE_ID,
    }),
    'front-component-id',
  );
  store.set(
    viewableFrontComponentRecordContextComponentState.atomFamily({
      instanceId: PAGE_INSTANCE_ID,
    }),
    recordContext,
  );

  render(
    <JotaiProvider store={store}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: PAGE_INSTANCE_ID }}
      >
        <SidePanelFrontComponentPage />
      </SidePanelPageComponentInstanceContext.Provider>
    </JotaiProvider>,
  );
};

describe('SidePanelFrontComponentPage', () => {
  it.each([
    {
      description: 'the record and its object',
      recordContext: {
        objectNameSingular: 'company',
        selectedRecordIds: ['record-id'],
      },
      expectedContent: 'front-component-id:company:record-id:no filter',
    },
    {
      description: 'every selected record and its object',
      recordContext: {
        objectNameSingular: 'company',
        selectedRecordIds: ['record-1', 'record-2'],
      },
      expectedContent: 'front-component-id:company:record-1,record-2:no filter',
    },
    {
      description: 'the filter of a Select all, which has no ids',
      recordContext: {
        objectNameSingular: 'company',
        selectedRecordIds: [],
        selectedRecordsFilter: { not: { id: { in: ['record-3'] } } },
      },
      expectedContent:
        'front-component-id:company::{"not":{"id":{"in":["record-3"]}}}',
    },
    {
      description: 'selected records without an object name',
      recordContext: { selectedRecordIds: ['record-1', 'record-2'] },
      expectedContent:
        'front-component-id:no object:record-1,record-2:no filter',
    },
    {
      description: 'the object when no record is selected',
      recordContext: { objectNameSingular: 'company' },
      expectedContent: 'front-component-id:company:no records:no filter',
    },
    {
      description: 'no object without a record context',
      recordContext: null,
      expectedContent: 'front-component-id:no object:no records:no filter',
    },
  ])(
    'hands the component $description',
    async ({ recordContext, expectedContent }) => {
      renderSidePanelFrontComponentPage(recordContext);

      expect(await screen.findByTestId('front-component')).toHaveTextContent(
        expectedContent,
      );
    },
  );
});
