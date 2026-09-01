import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Store } from 'jotai/vanilla/store';

import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPONENT_INSTANCE_ID = 'multiple-record-picker-test';
const FOCUS_ID = 'multiple-record-picker-focus';
const mockPerformSearch = jest.fn();

jest.mock(
  '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch',
  () => ({
    useMultipleRecordPickerPerformSearch: () => ({
      performSearch: mockPerformSearch,
    }),
  }),
);

const renderPicker = (
  targetNames: string[],
  onCreate = jest.fn().mockResolvedValue(undefined),
) => {
  const objectMetadataItems = targetNames.map(getMockObjectMetadataItemOrThrow);
  let store: Store;
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (initializedStore) => {
      store = initializedStore;
      initializedStore.set(
        multipleRecordPickerSearchableObjectMetadataItemsComponentState.atomFamily(
          { instanceId: COMPONENT_INSTANCE_ID },
        ),
        objectMetadataItems,
      );
    },
  });

  render(
    <I18nProvider i18n={i18n}>
      <MultipleRecordPicker
        componentInstanceId={COMPONENT_INSTANCE_ID}
        focusId={FOCUS_ID}
        onClickOutside={jest.fn()}
        onCreate={onCreate}
      />
    </I18nProvider>,
    { wrapper: Wrapper },
  );

  return { objectMetadataItems, onCreate, store: store! };
};

describe('MultipleRecordPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates directly when only one target type is available', async () => {
    const user = userEvent.setup();
    const { objectMetadataItems, onCreate } = renderPicker(['person']);

    await user.click(screen.getByText('Add New'));

    expect(onCreate).toHaveBeenCalledWith({
      objectMetadataItemId: objectMetadataItems[0].id,
      searchInput: '',
    });
  });

  it('asks for the target type when multiple targets are available', async () => {
    const user = userEvent.setup();
    const { objectMetadataItems, onCreate } = renderPicker([
      'person',
      'company',
    ]);

    await user.click(screen.getByText('Add New'));

    expect(screen.getByText('Select a record type')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();

    await user.click(screen.getByText('Company'));

    expect(onCreate).toHaveBeenCalledWith({
      objectMetadataItemId: objectMetadataItems[1].id,
      searchInput: '',
    });
  });

  it('ignores concurrent create attempts', async () => {
    const user = userEvent.setup();
    const onCreate = jest.fn(() => new Promise(() => undefined));

    renderPicker(['person'], onCreate);

    await user.dblClick(screen.getByText('Add New'));

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('keeps a created record selected when search has not indexed it yet', async () => {
    const user = userEvent.setup();
    const createdMorphItem = {
      recordId: 'new-person-id',
      objectMetadataId: getMockObjectMetadataItemOrThrow('person').id,
      isSelected: true,
      isMatchingSearchFilter: true,
    };
    const onCreate = jest.fn().mockResolvedValue(createdMorphItem);
    const { store } = renderPicker(['person'], onCreate);

    mockPerformSearch.mockImplementation(async () => {
      store.set(
        multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
          instanceId: COMPONENT_INSTANCE_ID,
        }),
        [{ ...createdMorphItem, isSelected: false }],
      );
    });

    await user.click(screen.getByText('Add New'));

    await waitFor(() => expect(mockPerformSearch).toHaveBeenCalled());

    expect(
      store.get(
        multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
          instanceId: COMPONENT_INSTANCE_ID,
        }),
      ),
    ).toEqual([createdMorphItem]);
  });
});
