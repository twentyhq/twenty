import { fireEvent, render, screen } from '@testing-library/react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
jest.mock('@/object-record/hooks/useObjectPermissionsForObject');
jest.mock('@/object-record/utils/canCreateRecordsForObjectMetadataItem');
jest.mock(
  '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerItemsDisplay',
  () => ({ MultipleRecordPickerItemsDisplay: () => null }),
);
jest.mock(
  '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerOnClickOutsideEffect',
  () => ({ MultipleRecordPickerOnClickOutsideEffect: () => null }),
);
jest.mock(
  '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerSearchInput',
  () => ({ MultipleRecordPickerSearchInput: () => null }),
);
jest.mock('@/ui/layout/selectable-list/hooks/useSelectableList', () => ({
  useSelectableList: () => ({ resetSelectedItem: jest.fn() }),
}));
jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: jest.fn(),
}));
jest.mock('@/ui/input/relation-picker/components/CreateNewButton', () => ({
  CreateNewButton: ({
    disabled,
    onClick,
  }: {
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} onClick={onClick}>
      Add New
    </button>
  ),
}));

describe('MultipleRecordPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useObjectMetadataItems as jest.Mock).mockReturnValue({
      objectMetadataItems: [{ id: 'target-object-id' }],
    });
    (useObjectPermissionsForObject as jest.Mock).mockReturnValue({});
    (canCreateRecordsForObjectMetadataItem as jest.Mock).mockReturnValue(true);
  });

  it('disables create while the owning mutation is pending', () => {
    const onCreate = jest.fn();

    const { rerender } = render(
      <MultipleRecordPicker
        componentInstanceId="picker"
        focusId="picker"
        objectMetadataItemIdForCreate="target-object-id"
        onClickOutside={jest.fn()}
        onCreate={onCreate}
        isCreatePending
      />,
    );

    const addNewButton = screen.getByRole('button', { name: 'Add New' });

    fireEvent.click(addNewButton);

    expect(onCreate).not.toHaveBeenCalled();
    expect(addNewButton).toBeDisabled();

    rerender(
      <MultipleRecordPicker
        componentInstanceId="picker"
        focusId="picker"
        objectMetadataItemIdForCreate="target-object-id"
        onClickOutside={jest.fn()}
        onCreate={onCreate}
      />,
    );

    expect(addNewButton).toBeEnabled();
    fireEvent.click(addNewButton);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
