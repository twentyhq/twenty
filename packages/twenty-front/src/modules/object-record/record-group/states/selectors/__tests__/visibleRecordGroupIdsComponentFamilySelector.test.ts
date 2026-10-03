import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { visibleRecordGroupIdsIncludingEmptyComponentSelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsIncludingEmptyComponentSelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexShouldHideEmptyRecordGroupsComponentState } from '@/object-record/record-index/states/recordIndexShouldHideEmptyRecordGroupsComponentState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewType } from '@/views/types/ViewType';

const instanceId = 'record-index-id';

const getVisibleRecordGroupIds = () =>
  jotaiStore.get(
    visibleRecordGroupIdsComponentFamilySelector.selectorFamily({
      instanceId,
      familyKey: ViewType.LIST,
    }),
  );

const getVisibleRecordGroupIdsIncludingEmpty = () =>
  jotaiStore.get(
    visibleRecordGroupIdsIncludingEmptyComponentSelector.selectorFamily({
      instanceId,
    }),
  );

describe('visible record group ids selectors', () => {
  beforeEach(() => {
    resetJotaiStore();

    jotaiStore.set(recordGroupIdsComponentState.atomFamily({ instanceId }), [
      'empty-group',
      'hidden-group',
      'second-group',
      'first-group',
    ]);

    for (const [recordGroupId, position, isVisible, recordIds] of [
      ['first-group', 0, true, ['a']],
      ['empty-group', 0.5, true, []],
      ['hidden-group', 0.7, false, ['b']],
      ['second-group', 1, true, ['c']],
    ] as const) {
      jotaiStore.set(
        recordGroupDefinitionFamilyState.atomFamily(recordGroupId),
        {
          id: recordGroupId,
          position,
          isVisible,
          title: recordGroupId,
        } as RecordGroupDefinition,
      );
      jotaiStore.set(
        recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
          instanceId,
          familyKey: recordGroupId,
        }),
        [...recordIds],
      );
    }
  });

  it('should list visible groups in order, empty ones included', () => {
    expect(getVisibleRecordGroupIds()).toEqual([
      'first-group',
      'empty-group',
      'second-group',
    ]);
  });

  it('should leave empty groups out when they are hidden, except in the including-empty list', () => {
    jotaiStore.set(
      recordIndexShouldHideEmptyRecordGroupsComponentState.atomFamily({
        instanceId,
      }),
      true,
    );

    expect(getVisibleRecordGroupIds()).toEqual(['first-group', 'second-group']);
    expect(getVisibleRecordGroupIdsIncludingEmpty()).toEqual([
      'first-group',
      'empty-group',
      'second-group',
    ]);
  });
});
