import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type View } from '@/views/types/View';
import { type ViewField } from '@/views/types/ViewField';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const viewId = 'test-view-id';
const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
  objectMetadataItem.namePlural,
  viewId,
);

const currentRecordFieldsAtom = currentRecordFieldsComponentState.atomFamily({
  instanceId: recordIndexId,
});

const selectableFieldMetadataItems = objectMetadataItem.fields.filter(
  (field) => field.isActive && !isHiddenSystemField(field),
);

const buildViewField = (fieldMetadataId: string, position: number): ViewField => ({
  id: `view-field-${fieldMetadataId}`,
  fieldMetadataId,
  position,
  isActive: true,
  isVisible: true,
  size: 100,
  aggregateOperation: null,
});

const buildView = (viewFields: ViewField[]): Pick<View, 'id' | 'viewFields'> => ({
  id: viewId,
  viewFields,
});

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const renderUseLoadRecordIndexStates = () =>
  renderHook(() => useLoadRecordIndexStates(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Wrapper>{children}</Wrapper>
    ),
  });

describe('useLoadRecordIndexStates - syncRecordIndexViewFields', () => {
  it('should populate current record fields from the view fields', () => {
    const { result } = renderUseLoadRecordIndexStates();

    const [firstField, secondField] = selectableFieldMetadataItems;
    const view = buildView([
      buildViewField(firstField.id, 0),
      buildViewField(secondField.id, 1),
    ]);

    act(() => {
      result.current.syncRecordIndexViewFields(view, objectMetadataItem);
    });

    const recordFields = jotaiStore.get(currentRecordFieldsAtom);

    expect(recordFields.map((recordField) => recordField.fieldMetadataItemId)).toEqual(
      [firstField.id, secondField.id],
    );
    expect(jotaiStore.get(recordIndexFieldDefinitionsState.atom).length).toBeGreaterThan(0);
  });

  // Regression for #19023: view fields arriving after the initial load (e.g.
  // via SSE while AI is creating metadata) must propagate to the record index.
  it('should apply view fields that arrive after the initial sync', () => {
    const { result } = renderUseLoadRecordIndexStates();

    const [firstField, secondField, lateField] = selectableFieldMetadataItems;

    act(() => {
      result.current.syncRecordIndexViewFields(
        buildView([buildViewField(firstField.id, 0), buildViewField(secondField.id, 1)]),
        objectMetadataItem,
      );
    });

    expect(jotaiStore.get(currentRecordFieldsAtom)).toHaveLength(2);

    act(() => {
      result.current.syncRecordIndexViewFields(
        buildView([
          buildViewField(firstField.id, 0),
          buildViewField(secondField.id, 1),
          buildViewField(lateField.id, 2),
        ]),
        objectMetadataItem,
      );
    });

    const recordFields = jotaiStore.get(currentRecordFieldsAtom);

    expect(recordFields).toHaveLength(3);
    expect(recordFields.map((recordField) => recordField.fieldMetadataItemId)).toContain(
      lateField.id,
    );
  });

  // The effect calls syncRecordIndexViewFields on every relevant render, so it
  // must be idempotent: an unchanged view must not produce a new state value.
  it('should not rewrite current record fields when the view fields are unchanged', () => {
    const { result } = renderUseLoadRecordIndexStates();

    const [firstField, secondField] = selectableFieldMetadataItems;
    const viewFields = [
      buildViewField(firstField.id, 0),
      buildViewField(secondField.id, 1),
    ];

    act(() => {
      result.current.syncRecordIndexViewFields(buildView(viewFields), objectMetadataItem);
    });

    const recordFieldsAfterFirstSync = jotaiStore.get(currentRecordFieldsAtom);

    act(() => {
      // Fresh, deeply-equal view object (new array identity)
      result.current.syncRecordIndexViewFields(
        buildView([
          buildViewField(firstField.id, 0),
          buildViewField(secondField.id, 1),
        ]),
        objectMetadataItem,
      );
    });

    expect(jotaiStore.get(currentRecordFieldsAtom)).toBe(recordFieldsAfterFirstSync);
  });
});
