import { renderHook } from '@testing-library/react';

import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type View } from '@/views/types/View';
import { act } from 'react';
import { ViewType, ViewVisibility } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const recordIndexId = 'record-table-widget-record-index-id';
const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const makeView = (anyFieldFilterValue: string | null): View => ({
  id: 'view-id',
  name: 'Widget view',
  type: ViewType.TABLE,
  objectMetadataId: objectMetadataItem.id,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
  shouldHideEmptyGroups: false,
  position: 0,
  icon: 'IconTable',
  anyFieldFilterValue,
  visibility: ViewVisibility.WORKSPACE,
  isActive: true,
});

const renderUseLoadRecordIndexStates = () =>
  renderHook(() => useLoadRecordIndexStates(), {
    wrapper: getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [],
      objectMetadataItems: [objectMetadataItem],
    }),
  });

describe('useLoadRecordIndexStates', () => {
  it('hydrates the scoped any-field filter from the loaded view', () => {
    const { result } = renderUseLoadRecordIndexStates();

    act(() => {
      result.current.loadRecordIndexStates(
        makeView('Acme'),
        objectMetadataItem,
        {
          skipGlobalIndexStates: true,
          recordIndexId,
        },
      );
    });

    expect(
      jotaiStore.get(
        anyFieldFilterValueComponentState.atomFamily({
          instanceId: recordIndexId,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    ).toBe('Acme');
  });

  it('clears a stale scoped any-field filter when the loaded view has none', () => {
    const anyFieldFilterValueAtom =
      anyFieldFilterValueComponentState.atomFamily({
        instanceId: recordIndexId,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      });

    const { result } = renderUseLoadRecordIndexStates();

    act(() => {
      jotaiStore.set(anyFieldFilterValueAtom, 'stale value');
      result.current.loadRecordIndexStates(makeView(null), objectMetadataItem, {
        skipGlobalIndexStates: true,
        recordIndexId,
      });
    });

    expect(jotaiStore.get(anyFieldFilterValueAtom)).toBe('');
  });
});
