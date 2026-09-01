import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPONENT_INSTANCE_ID = 'multiple-record-picker-test';
const FOCUS_ID = 'multiple-record-picker-focus';

const renderPicker = (
  targetNames: string[],
  onCreate = jest.fn().mockResolvedValue(undefined),
) => {
  const objectMetadataItems = targetNames.map(getMockObjectMetadataItemOrThrow);
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
      store.set(
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

  return { objectMetadataItems, onCreate };
};

describe('MultipleRecordPicker', () => {
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
});
