/* eslint-disable no-console */
// Reproduction harness for the kanban scale review: mounts a real
// RecordBoardColumn (cards, inline cells, dnd-kit) and measures DOM nodes,
// jotai subscriptions, mount time, heap and re-render amplification.
import { MockedProvider } from '@apollo/client/testing/react';
import { useDragDropManager } from '@dnd-kit/react';
import { act, fireEvent, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode, useEffect, useRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { ToastProvider } from 'twenty-ui/components/feedback';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { UserContext } from '@/users/contexts/UserContext';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { FileUploadProvider } from '@/file-upload/components/FileUploadProvider';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumn } from '@/object-record/record-board/record-board-column/components/RecordBoardColumn';
import { RecordBoardDndKitProvider } from '@/object-record/record-board/record-board-dnd/providers/RecordBoardDndKitProvider';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { isRecordBoardCardFocusedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardFocusedComponentFamilyState';
import { isRecordBoardDropProcessingComponentState } from '@/object-record/record-board/states/isRecordBoardDropProcessingComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordSelectionDragSelect } from '@/object-record/record-selection/components/RecordSelectionDragSelect';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { JestRecordIndexContextProviderWrapper } from '~/testing/jest/JestRecordIndexContextProviderWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const renderCounters = {
  cardContextProvider: 0,
  card: 0,
  cardBody: 0,
  inlineCell: 0,
};

jest.mock(
  '@/object-record/record-board/record-board-card/components/RecordBoardCardBody',
  () => {
    const actual = jest.requireActual(
      '@/object-record/record-board/record-board-card/components/RecordBoardCardBody',
    );
    return {
      ...actual,
      RecordBoardCardBody: (props: any) => {
        renderCounters.cardBody += 1;
        return actual.RecordBoardCardBody(props);
      },
    };
  },
);

jest.mock(
  '@/object-record/record-board/record-board-card/components/RecordBoardCard',
  () => {
    const actual = jest.requireActual(
      '@/object-record/record-board/record-board-card/components/RecordBoardCard',
    );
    return {
      ...actual,
      RecordBoardCard: (props: any) => {
        renderCounters.card += 1;
        return actual.RecordBoardCard(props);
      },
    };
  },
);

jest.mock(
  '@/object-record/record-inline-cell/components/RecordInlineCell',
  () => {
    const actual = jest.requireActual(
      '@/object-record/record-inline-cell/components/RecordInlineCell',
    );
    return {
      ...actual,
      RecordInlineCell: (props: any) => {
        renderCounters.inlineCell += 1;
        return actual.RecordInlineCell(props);
      },
    };
  },
);

// The "new record" button sits outside the per-card subtree and needs the
// record creation form context; it is irrelevant to per-card cost.
jest.mock(
  '@/object-record/record-board/record-board-column/components/RecordBoardColumnNewRecordButton',
  () => ({ RecordBoardColumnNewRecordButton: () => null }),
);

const jotaiHookCounters = { useAtomValue: 0, useAtom: 0, useSetAtom: 0 };

jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai');
  return {
    ...actual,
    useAtomValue: (...args: any[]) => {
      jotaiHookCounters.useAtomValue += 1;
      return actual.useAtomValue(...args);
    },
    useAtom: (...args: any[]) => {
      jotaiHookCounters.useAtom += 1;
      return actual.useAtom(...args);
    },
    useSetAtom: (...args: any[]) => {
      jotaiHookCounters.useSetAtom += 1;
      return actual.useSetAtom(...args);
    },
  };
});

const resetCounters = () => {
  renderCounters.cardContextProvider = 0;
  renderCounters.card = 0;
  renderCounters.cardBody = 0;
  renderCounters.inlineCell = 0;
  jotaiHookCounters.useAtomValue = 0;
  jotaiHookCounters.useAtom = 0;
  jotaiHookCounters.useSetAtom = 0;
};

const VIEW_INSTANCE_ID = 'instanceId';
const RECORD_BOARD_ID = 'record-board-id';
const COLUMN_ID = 'column-0';

const VISIBLE_FIELD_NAMES = [
  'name',
  'domainName',
  'employees',
  'createdAt',
  'address',
  'linkedinLink',
  'annualRecurringRevenue',
  'idealCustomerProfile',
  'accountOwner',
];

const getCompanyObjectMetadataItem = (): EnrichedObjectMetadataItem => {
  const item = getTestEnrichedObjectMetadataItemsMock().find(
    (objectMetadataItem) => objectMetadataItem.nameSingular === 'company',
  );
  if (!item) {
    throw new Error('company metadata missing from mocks');
  }
  return item;
};

const buildRecord = (index: number) => ({
  id: `record-${index}`,
  __typename: 'Company',
  name: `Company ${index}`,
  domainName: {
    primaryLinkUrl: `https://company-${index}.com`,
    primaryLinkLabel: '',
    secondaryLinks: [],
  },
  employees: index,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  address: {
    addressStreet1: `${index} Main St`,
    addressStreet2: '',
    addressCity: 'Paris',
    addressState: '',
    addressCountry: 'FR',
    addressPostcode: '75001',
    addressLat: null,
    addressLng: null,
  },
  linkedinLink: {
    primaryLinkUrl: `https://linkedin.com/company/${index}`,
    primaryLinkLabel: '',
    secondaryLinks: [],
  },
  annualRecurringRevenue: { amountMicros: index * 1000000, currencyCode: 'USD' },
  idealCustomerProfile: index % 2 === 0,
  accountOwnerId: null,
  accountOwner: null,
  position: index,
});

const buildFlatView = (objectMetadataId: string) => ({
  id: 'view-1',
  name: 'Kanban',
  objectMetadataId,
  isActive: true,
  isCompact: false,
  type: 'KANBAN',
  key: null,
  icon: 'IconList',
  position: 0,
  kanbanAggregateOperation: null,
  kanbanAggregateOperationFieldMetadataId: null,
  openRecordIn: 'SIDE_PANEL',
  visibility: 'WORKSPACE',
  anyFieldFilterValue: null,
  calendarFieldMetadataId: null,
  calendarLayout: null,
  mainGroupByFieldMetadataId: null,
  shouldHideEmptyGroups: false,
  kanbanColumnWidth: 200,
});

const seedStore = ({
  cardCount,
  objectMetadataItem,
}: {
  cardCount: number;
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  resetJotaiStore();
  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  const visibleFields = VISIBLE_FIELD_NAMES.map((fieldName, position) => {
    const fieldMetadataItem = objectMetadataItem.fields.find(
      (field) => field.name === fieldName,
    );
    if (!fieldMetadataItem) {
      throw new Error(`field ${fieldName} missing from company mock`);
    }
    return {
      id: `record-field-${fieldName}`,
      fieldMetadataItemId: fieldMetadataItem.id,
      position,
      isVisible: true,
      size: 100,
    };
  });

  jotaiStore.set(
    currentRecordFieldsComponentState.atomFamily({
      instanceId: VIEW_INSTANCE_ID,
    }),
    visibleFields,
  );

  const groupDefinition: RecordGroupDefinition = {
    id: COLUMN_ID,
    type: RecordGroupDefinitionType.Value,
    title: 'Column 0',
    value: 'true',
    color: 'blue',
    position: 0,
    isVisible: true,
  };

  jotaiStore.set(
    recordGroupDefinitionFamilyState.atomFamily(COLUMN_ID),
    groupDefinition,
  );
  jotaiStore.set(
    recordGroupIdsComponentState.atomFamily({ instanceId: VIEW_INSTANCE_ID }),
    [COLUMN_ID],
  );
  jotaiStore.set(
    recordBoardShouldFetchMoreInColumnComponentFamilyState.atomFamily({
      instanceId: RECORD_BOARD_ID,
      familyKey: COLUMN_ID,
    }),
    false,
  );

  jotaiStore.set(metadataStoreState.atomFamily('views'), {
    current: [buildFlatView(objectMetadataItem.id)],
    draft: [],
    status: 'up-to-date',
  });
  jotaiStore.set(
    contextStoreCurrentViewIdComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    'view-1',
  );

  const recordIds: string[] = [];
  for (let index = 0; index < cardCount; index += 1) {
    const record = buildRecord(index);
    recordIds.push(record.id);
    jotaiStore.set(recordStoreFamilyState.atomFamily(record.id), record);
  }

  jotaiStore.set(
    recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
      instanceId: VIEW_INSTANCE_ID,
      familyKey: COLUMN_ID,
    }),
    recordIds,
  );

  return { recordIds };
};

const dndRegistryCounts = { droppables: 0, draggables: 0 };

const DndRegistryProbe = () => {
  const manager = useDragDropManager();
  useEffect(() => {
    if (!manager) {
      return;
    }
    dndRegistryCounts.droppables = Array.from(
      manager.registry.droppables,
    ).length;
    dndRegistryCounts.draggables = Array.from(
      manager.registry.draggables,
    ).length;
  });
  return null;
};

const Wrapper = ({
  children,
  objectMetadataItem,
}: {
  children: ReactNode;
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.name === 'idealCustomerProfile',
  );
  if (!selectFieldMetadataItem) {
    throw new Error('group field missing');
  }

  return (
    <JotaiProvider store={jotaiStore}>
      <MockedProvider>
        <MemoryRouter>
        <I18nProvider i18n={i18n}>
        <UserContext.Provider
          value={{
            dateFormat: DateFormat.DAY_FIRST,
            timeFormat: TimeFormat.HOUR_24,
            timeZone: 'UTC',
          }}
        >
        <ToastProvider>
        <FileUploadProvider>
        <PreComputedChipGeneratorsProvider>
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={VIEW_INSTANCE_ID}
        >
          <ViewComponentInstanceContext.Provider
            value={{ instanceId: VIEW_INSTANCE_ID }}
          >
            <ContextStoreComponentInstanceContext.Provider
              value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
            >
              <JestRecordIndexContextProviderWrapper
                objectMetadataItem={objectMetadataItem}
              >
                <RecordBoardContext.Provider
                  value={{
                    objectMetadataItem,
                    selectFieldMetadataItem,
                    createOneRecord: async () => ({}) as any,
                    updateOneRecord: async () => ({}) as any,
                    deleteOneRecord: async () => ({}) as any,
                    recordBoardId: RECORD_BOARD_ID,
                    objectPermissions: {
                      objectMetadataId: objectMetadataItem.id,
                      canReadObjectRecords: true,
                      canUpdateObjectRecords: true,
                      canSoftDeleteObjectRecords: true,
                      canDestroyObjectRecords: true,
                    } as any,
                  }}
                >
                  <RecordBoardComponentInstanceContext.Provider
                    value={{ instanceId: RECORD_BOARD_ID }}
                  >
                    <RecordBoardDndKitProvider>
                      {children}
                      <DndRegistryProbe />
                    </RecordBoardDndKitProvider>
                  </RecordBoardComponentInstanceContext.Provider>
                </RecordBoardContext.Provider>
              </JestRecordIndexContextProviderWrapper>
            </ContextStoreComponentInstanceContext.Provider>
          </ViewComponentInstanceContext.Provider>
        </RecordComponentInstanceContextsWrapper>
        </PreComputedChipGeneratorsProvider>
        </FileUploadProvider>
        </ToastProvider>
        </UserContext.Provider>
        </I18nProvider>
        </MemoryRouter>
      </MockedProvider>
    </JotaiProvider>
  );
};

const forceGc = () => {
  if (typeof (globalThis as any).gc === 'function') {
    (globalThis as any).gc();
  }
};

const mountColumn = (cardCount: number) => {
  const objectMetadataItem = getCompanyObjectMetadataItem();
  const { recordIds } = seedStore({ cardCount, objectMetadataItem });
  resetCounters();
  forceGc();
  const heapBefore = process.memoryUsage().heapUsed;
  const start = performance.now();
  const rendered = render(
    <RecordBoardColumn
      recordBoardColumnId={COLUMN_ID}
      recordBoardColumnIndex={0}
    />,
    {
      wrapper: ({ children }) => (
        <Wrapper objectMetadataItem={objectMetadataItem}>{children}</Wrapper>
      ),
    },
  );
  const mountMs = performance.now() - start;
  forceGc();
  const heapAfter = process.memoryUsage().heapUsed;

  return { rendered, recordIds, mountMs, heapDelta: heapAfter - heapBefore };
};

describe('RecordBoardColumnCardsContainer at scale (perf reproduction)', () => {
  beforeAll(() => {
    if (typeof window.matchMedia !== 'function') {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    }
  });

  it('measures DOM nodes, hooks and mount time per card', () => {
    const results: Record<string, unknown>[] = [];

    for (const cardCount of [50, 200]) {
      const { rendered, mountMs, heapDelta } = mountColumn(cardCount);
      const container = rendered.container;
      const totalNodes = container.querySelectorAll('*').length;
      const cardNodes = container.querySelectorAll(
        '[data-selectable-id]',
      ).length;
      const sortableNodes = container.querySelectorAll(
        '[aria-roledescription]',
      ).length;

      results.push({
        cardCount,
        cardsRendered: cardNodes,
        dndSortableElements: sortableNodes,
        dndRegistry: { ...dndRegistryCounts },
        totalDomNodes: totalNodes,
        domNodesPerCard: Math.round(totalNodes / cardCount),
        mountMs: Math.round(mountMs),
        mountMsPerCard: (mountMs / cardCount).toFixed(2),
        heapDeltaMB: (heapDelta / 1024 / 1024).toFixed(1),
        heapKBPerCard: (heapDelta / 1024 / cardCount).toFixed(1),
        renders: { ...renderCounters },
        jotaiHooksOnMount: { ...jotaiHookCounters },
        jotaiUseAtomValuePerCard: (
          jotaiHookCounters.useAtomValue / cardCount
        ).toFixed(1),
      });

      expect(cardNodes).toBe(cardCount);
      rendered.unmount();
    }

    console.log(
      'MOUNT_RESULTS ' + JSON.stringify(results, null, 2),
    );
  }, 300000);

  it('measures re-render amplification for board-level state changes', () => {
    const cardCount = 200;
    const { rendered, recordIds } = mountColumn(cardCount);
    const amplification: Record<string, unknown> = {};

    const measure = (label: string, action: () => void) => {
      resetCounters();
      const start = performance.now();
      act(() => {
        action();
      });
      const elapsed = performance.now() - start;
      amplification[label] = {
        useAtomValueCalls: jotaiHookCounters.useAtomValue,
        cardRenders: renderCounters.card,
        cardBodyRenders: renderCounters.cardBody,
        inlineCellRenders: renderCounters.inlineCell,
        ms: Math.round(elapsed),
      };
    };

    measure('focus one card (ArrowDown equivalent)', () => {
      jotaiStore.set(
        isRecordBoardCardFocusedComponentFamilyState.atomFamily({
          instanceId: RECORD_BOARD_ID,
          familyKey: { rowIndex: 5, columnIndex: 0 },
        }),
        true,
      );
    });

    measure('move focus to next card', () => {
      jotaiStore.set(
        isRecordBoardCardFocusedComponentFamilyState.atomFamily({
          instanceId: RECORD_BOARD_ID,
          familyKey: { rowIndex: 5, columnIndex: 0 },
        }),
        false,
      );
      jotaiStore.set(
        isRecordBoardCardFocusedComponentFamilyState.atomFamily({
          instanceId: RECORD_BOARD_ID,
          familyKey: { rowIndex: 6, columnIndex: 0 },
        }),
        true,
      );
    });

    measure('select one record (checkbox / x key)', () => {
      jotaiStore.set(
        isRecordSelectedComponentFamilyState.atomFamily({
          instanceId: VIEW_INSTANCE_ID,
          familyKey: recordIds[3],
        }),
        true,
      );
    });

    measure('drag start (draggedRecordIds set)', () => {
      jotaiStore.set(
        draggedRecordIdsComponentState.atomFamily({
          instanceId: VIEW_INSTANCE_ID,
        }),
        [recordIds[0]],
      );
    });

    measure('drag end (draggedRecordIds cleared)', () => {
      jotaiStore.set(
        draggedRecordIdsComponentState.atomFamily({
          instanceId: VIEW_INSTANCE_ID,
        }),
        [],
      );
    });

    measure('drop processing flag true', () => {
      jotaiStore.set(
        isRecordBoardDropProcessingComponentState.atomFamily({
          instanceId: RECORD_BOARD_ID,
        }),
        true,
      );
    });

    measure('drop processing flag false (500ms later)', () => {
      jotaiStore.set(
        isRecordBoardDropProcessingComponentState.atomFamily({
          instanceId: RECORD_BOARD_ID,
        }),
        false,
      );
    });

    measure('fetch-more appends 10 ids to the column', () => {
      const newIds: string[] = [];
      for (let index = cardCount; index < cardCount + 10; index += 1) {
        const record = buildRecord(index);
        newIds.push(record.id);
        jotaiStore.set(recordStoreFamilyState.atomFamily(record.id), record);
      }
      jotaiStore.set(
        recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
          instanceId: VIEW_INSTANCE_ID,
          familyKey: COLUMN_ID,
        }),
        [...recordIds, ...newIds],
      );
    });

    measure('views metadata re-emitted (same content, new objects)', () => {
      jotaiStore.set(metadataStoreState.atomFamily('views'), {
        current: [buildFlatView(getCompanyObjectMetadataItem().id)],
        draft: [],
        status: 'up-to-date',
      });
    });

    measure('object metadata re-emitted (same content, new objects)', () => {
      setTestObjectMetadataItemsInMetadataStore(
        jotaiStore,
        getTestEnrichedObjectMetadataItemsMock().map((item) => ({ ...item })),
      );
    });

    measure('one record field value updated (SSE update)', () => {
      jotaiStore.set(recordStoreFamilyState.atomFamily(recordIds[10]), {
        ...buildRecord(10),
        employees: 999,
      });
    });

    console.log(
      'AMPLIFICATION_RESULTS ' + JSON.stringify(amplification, null, 2),
    );

    rendered.unmount();

    // Nothing clears the record store or the column id list on unmount.
    const recordAfterUnmount = jotaiStore.get(
      recordStoreFamilyState.atomFamily(recordIds[0]),
    );
    const idsAfterUnmount = jotaiStore.get(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId: VIEW_INSTANCE_ID,
        familyKey: COLUMN_ID,
      }),
    );
    console.log(
      'RETENTION_AFTER_UNMOUNT ' +
        JSON.stringify({
          recordStillInStore: recordAfterUnmount !== null,
          columnIdsStillInStore: idsAfterUnmount.length,
        }),
    );
    expect(recordAfterUnmount).not.toBeNull();
    expect(idsAfterUnmount.length).toBe(cardCount + 10);

    // Family atoms live in module-level Maps that are never evicted, even
    // when the jotai store itself is replaced.
    const atomBefore = recordStoreFamilyState.atomFamily('retained-record');
    resetJotaiStore();
    expect(recordStoreFamilyState.atomFamily('retained-record')).toBe(
      atomBefore,
    );
  }, 300000);

  it('measures the drag-select mousemove handler over all cards', () => {
    const cardCount = 200;
    const objectMetadataItem = getCompanyObjectMetadataItem();
    seedStore({ cardCount, objectMetadataItem });

    const BoardWithDragSelect = () => {
      const boardRef = useRef<HTMLDivElement>(null);
      return (
        <div ref={boardRef} data-testid="board">
          <RecordBoardColumn
            recordBoardColumnId={COLUMN_ID}
            recordBoardColumnIndex={0}
          />
          <RecordSelectionDragSelect selectableItemsContainerRef={boardRef} />
        </div>
      );
    };

    const rendered = render(<BoardWithDragSelect />, {
      wrapper: ({ children }) => (
        <Wrapper objectMetadataItem={objectMetadataItem}>{children}</Wrapper>
      ),
    });

    const columnElement = rendered.container.querySelector(
      '[data-record-board-column-id]',
    ) as HTMLElement;

    let getBoundingClientRectCalls = 0;
    const originalGetBoundingClientRect =
      HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = function () {
      getBoundingClientRectCalls += 1;
      return originalGetBoundingClientRect.call(this);
    };

    act(() => {
      fireEvent.mouseDown(columnElement, { clientX: 2, clientY: 2 });
    });
    act(() => {
      fireEvent.mouseMove(document, { clientX: 40, clientY: 40 });
    });

    getBoundingClientRectCalls = 0;
    const moves = 20;
    const start = performance.now();
    for (let index = 0; index < moves; index += 1) {
      act(() => {
        fireEvent.mouseMove(document, {
          clientX: 50 + index,
          clientY: 50 + index,
        });
      });
    }
    const elapsed = performance.now() - start;

    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;

    console.log(
      'DRAG_SELECT_RESULTS ' +
        JSON.stringify({
          cardCount,
          moves,
          getBoundingClientRectCallsPerMove: getBoundingClientRectCalls / moves,
          msPerMoveInJsdom: (elapsed / moves).toFixed(2),
        }),
    );

    expect(getBoundingClientRectCalls / moves).toBeGreaterThanOrEqual(
      cardCount,
    );

    act(() => {
      fireEvent.mouseUp(document, { clientX: 60, clientY: 60 });
    });
    rendered.unmount();
  }, 300000);

  it('measures store-only selector cost with 30 columns x 1000 ids', () => {
    resetJotaiStore();
    const columnCount = 30;
    const idsPerColumn = 1000;
    const columnIds: string[] = [];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const columnId = `column-${columnIndex}`;
      columnIds.push(columnId);
      const ids: string[] = [];
      for (let rowIndex = 0; rowIndex < idsPerColumn; rowIndex += 1) {
        ids.push(`record-${columnIndex}-${rowIndex}`);
      }
      jotaiStore.set(
        recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
          instanceId: VIEW_INSTANCE_ID,
          familyKey: columnId,
        }),
        ids,
      );
    }
    jotaiStore.set(
      recordGroupIdsComponentState.atomFamily({ instanceId: VIEW_INSTANCE_ID }),
      columnIds,
    );

    const selectedIdsAtom = selectedRecordIdsComponentSelector.selectorFamily({
      instanceId: VIEW_INSTANCE_ID,
    });
    const allIdsAtom = recordIndexAllRecordIdsComponentSelector.selectorFamily({
      instanceId: VIEW_INSTANCE_ID,
    });

    let notifications = 0;
    const unsubscribe = jotaiStore.sub(selectedIdsAtom, () => {
      notifications += 1;
    });

    const firstReadStart = performance.now();
    const allIds = jotaiStore.get(allIdsAtom);
    jotaiStore.get(selectedIdsAtom);
    const firstReadMs = performance.now() - firstReadStart;

    const toggles = 20;
    const toggleStart = performance.now();
    for (let index = 0; index < toggles; index += 1) {
      jotaiStore.set(
        isRecordSelectedComponentFamilyState.atomFamily({
          instanceId: VIEW_INSTANCE_ID,
          familyKey: allIds[index * 37],
        }),
        true,
      );
    }
    const toggleMs = performance.now() - toggleStart;

    const appendStart = performance.now();
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId: VIEW_INSTANCE_ID,
        familyKey: columnIds[0],
      }),
      [
        ...jotaiStore.get(
          recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
            instanceId: VIEW_INSTANCE_ID,
            familyKey: columnIds[0],
          }),
        ),
        'record-0-1000',
      ],
    );
    const appendMs = performance.now() - appendStart;

    // Select-all loops store.set per id while the selectedRecordIds selector
    // is subscribed (RecordBoardSelectRecordsEffect), so each set recomputes
    // the O(N) selector: quadratic.
    const selectAllTimings: Record<string, string> = {};
    for (const batchSize of [100, 200, 400]) {
      for (let index = 0; index < allIds.length; index += 1) {
        // reset to unselected without timing
        jotaiStore.set(
          isRecordSelectedComponentFamilyState.atomFamily({
            instanceId: VIEW_INSTANCE_ID,
            familyKey: allIds[index],
          }),
          false,
        );
        if (index >= batchSize) break;
      }
      const selectAllStart = performance.now();
      for (let index = 0; index < batchSize; index += 1) {
        jotaiStore.set(
          isRecordSelectedComponentFamilyState.atomFamily({
            instanceId: VIEW_INSTANCE_ID,
            familyKey: allIds[index],
          }),
          true,
        );
      }
      selectAllTimings[`selectFirst${batchSize}Ms`] = (
        performance.now() - selectAllStart
      ).toFixed(0);
    }

    unsubscribe();

    console.log(
      'STORE_SELECTOR_RESULTS ' +
        JSON.stringify({
          totalIds: allIds.length,
          firstReadMs: firstReadMs.toFixed(1),
          msPerSelectionToggle: (toggleMs / toggles).toFixed(2),
          notificationsForToggles: notifications,
          msForOneFetchMoreAppend: appendMs.toFixed(2),
          ...selectAllTimings,
        }),
    );

    expect(allIds.length).toBe(columnCount * idsPerColumn);
  }, 300000);
});
