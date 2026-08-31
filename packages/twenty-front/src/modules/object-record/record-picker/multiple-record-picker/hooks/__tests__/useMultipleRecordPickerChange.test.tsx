import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useMultipleRecordPickerChange } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerChange';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');

const mockEnqueueErrorSnackBar = jest.fn();

const componentInstanceId = 'multiple-record-picker-test';
const objectMetadataId = 'person-object-metadata-id';

const createMorphItem = (
  recordId: string,
  isSelected: boolean,
): RecordPickerPickableMorphItem => ({
  recordId,
  objectMetadataId,
  isSelected,
  isMatchingSearchFilter: true,
});

const createDeferred = () => {
  let resolve: () => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
};

describe('useMultipleRecordPickerChange', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useSnackBar).mockReturnValue({
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    } as unknown as ReturnType<typeof useSnackBar>);
  });

  const setup = ({
    initialMorphItems,
    onChange,
  }: {
    initialMorphItems: RecordPickerPickableMorphItem[];
    onChange?: (
      morphItem: RecordPickerPickableMorphItem,
    ) => void | Promise<void>;
  }) => {
    const store = createStore();
    const pickableMorphItemsState =
      multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
        instanceId: componentInstanceId,
      });

    store.set(pickableMorphItemsState, initialMorphItems);

    const Wrapper = ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>
        <MultipleRecordPickerComponentInstanceContext.Provider
          value={{ instanceId: componentInstanceId }}
        >
          {children}
        </MultipleRecordPickerComponentInstanceContext.Provider>
      </JotaiProvider>
    );

    const renderChangeHook = () =>
      renderHook(() => useMultipleRecordPickerChange({ onChange }), {
        wrapper: Wrapper,
      });
    const renderedHook = renderChangeHook();

    return {
      ...renderedHook,
      getMorphItems: () => store.get(pickableMorphItemsState),
      remount: renderChangeHook,
      resetMorphItems: () => store.set(pickableMorphItemsState, []),
      setMorphItems: (morphItems: RecordPickerPickableMorphItem[]) =>
        store.set(pickableMorphItemsState, morphItems),
    };
  };

  it('serializes changes for the same morph item', async () => {
    const firstChange = createDeferred();
    const secondChange = createDeferred();
    const onChange = jest
      .fn()
      .mockReturnValueOnce(firstChange.promise)
      .mockReturnValueOnce(secondChange.promise);
    const initialMorphItem = createMorphItem('record-id', false);
    const { getMorphItems, result } = setup({
      initialMorphItems: [initialMorphItem],
      onChange,
    });

    let firstChangeResult: Promise<void> = Promise.resolve();
    let secondChangeResult: Promise<void> = Promise.resolve();
    act(() => {
      firstChangeResult = result.current.handleChange({
        ...initialMorphItem,
        isSelected: true,
      });
      secondChangeResult = result.current.handleChange(initialMorphItem);
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
    expect(getMorphItems()[0].isSelected).toBe(false);

    await act(async () => {
      firstChange.resolve();
      await firstChangeResult;
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));

    await act(async () => {
      secondChange.resolve();
      await secondChangeResult;
    });
  });

  it('keeps the item queue across picker unmount and remount', async () => {
    const selection = createDeferred();
    const deselection = createDeferred();
    const onChange = jest
      .fn()
      .mockReturnValueOnce(selection.promise)
      .mockReturnValueOnce(deselection.promise);
    const initialMorphItem = createMorphItem('record-id', false);
    const { remount, result, setMorphItems, unmount } = setup({
      initialMorphItems: [initialMorphItem],
      onChange,
    });

    let selectionResult: Promise<void> = Promise.resolve();
    act(() => {
      selectionResult = result.current.handleChange({
        ...initialMorphItem,
        isSelected: true,
      });
    });

    unmount();
    setMorphItems([{ ...initialMorphItem, isSelected: true }]);
    const remountedHook = remount();

    let deselectionResult: Promise<void> = Promise.resolve();
    act(() => {
      deselectionResult =
        remountedHook.result.current.handleChange(initialMorphItem);
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));

    await act(async () => {
      selection.resolve();
      await selectionResult;
    });
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));

    await act(async () => {
      deselection.resolve();
      await deselectionResult;
    });

    remountedHook.unmount();
  });

  it('runs changes for different morph items in parallel', async () => {
    const firstChange = createDeferred();
    const secondChange = createDeferred();
    const onChange = jest
      .fn()
      .mockReturnValueOnce(firstChange.promise)
      .mockReturnValueOnce(secondChange.promise);
    const firstMorphItem = createMorphItem('first-record-id', false);
    const secondMorphItem = createMorphItem('second-record-id', false);
    const { result } = setup({
      initialMorphItems: [firstMorphItem, secondMorphItem],
      onChange,
    });

    let firstChangeResult: Promise<void> = Promise.resolve();
    let secondChangeResult: Promise<void> = Promise.resolve();
    act(() => {
      firstChangeResult = result.current.handleChange({
        ...firstMorphItem,
        isSelected: true,
      });
      secondChangeResult = result.current.handleChange({
        ...secondMorphItem,
        isSelected: true,
      });
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));

    await act(async () => {
      firstChange.resolve();
      secondChange.resolve();
      await Promise.all([firstChangeResult, secondChangeResult]);
    });
  });

  it('rolls back and reports the latest rejected change', async () => {
    const change = createDeferred();
    const error = new Error('Could not update relation');
    const initialMorphItem = createMorphItem('record-id', false);
    const { getMorphItems, result } = setup({
      initialMorphItems: [initialMorphItem],
      onChange: () => change.promise,
    });

    let changeResult: Promise<void> = Promise.resolve();
    act(() => {
      changeResult = result.current.handleChange({
        ...initialMorphItem,
        isSelected: true,
      });
    });

    expect(getMorphItems()[0].isSelected).toBe(true);

    await act(async () => {
      change.reject(error);
      await changeResult;
    });

    expect(getMorphItems()[0].isSelected).toBe(false);
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledTimes(1);
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      apolloError: error,
    });
  });

  it('keeps a newer intent and continues its queue after a stale failure', async () => {
    const firstChange = createDeferred();
    const secondChange = createDeferred();
    const onChange = jest
      .fn()
      .mockReturnValueOnce(firstChange.promise)
      .mockReturnValueOnce(secondChange.promise);
    const initialMorphItem = createMorphItem('record-id', false);
    const { getMorphItems, result } = setup({
      initialMorphItems: [initialMorphItem],
      onChange,
    });

    let firstChangeResult: Promise<void> = Promise.resolve();
    let secondChangeResult: Promise<void> = Promise.resolve();
    act(() => {
      firstChangeResult = result.current.handleChange({
        ...initialMorphItem,
        isSelected: true,
      });
      secondChangeResult = result.current.handleChange(initialMorphItem);
    });

    await act(async () => {
      firstChange.reject(new Error('Stale failure'));
      await firstChangeResult;
    });

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    expect(getMorphItems()[0].isSelected).toBe(false);
    expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();

    await act(async () => {
      secondChange.resolve();
      await secondChangeResult;
    });
  });

  it('rolls consecutive failures back to the last confirmed selection', async () => {
    const deselection = createDeferred();
    const selection = createDeferred();
    const latestError = new Error('Could not restore relation');
    const onChange = jest
      .fn()
      .mockReturnValueOnce(deselection.promise)
      .mockReturnValueOnce(selection.promise);
    const initialMorphItem = createMorphItem('record-id', true);
    const { getMorphItems, result } = setup({
      initialMorphItems: [initialMorphItem],
      onChange,
    });

    let deselectionResult: Promise<void> = Promise.resolve();
    let selectionResult: Promise<void> = Promise.resolve();
    act(() => {
      deselectionResult = result.current.handleChange({
        ...initialMorphItem,
        isSelected: false,
      });
      selectionResult = result.current.handleChange(initialMorphItem);
    });

    await act(async () => {
      deselection.reject(new Error('Could not remove relation'));
      await deselectionResult;
    });
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));

    await act(async () => {
      selection.reject(latestError);
      await selectionResult;
    });

    expect(getMorphItems()[0].isSelected).toBe(true);
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledTimes(1);
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      apolloError: latestError,
    });
  });

  it('rolls a failed queued deselection back to the preceding successful selection', async () => {
    const selection = createDeferred();
    const deselectionError = new Error('Could not remove relation');
    const onChange = jest
      .fn()
      .mockReturnValueOnce(selection.promise)
      .mockRejectedValueOnce(deselectionError);
    const initialMorphItem = createMorphItem('record-id', false);
    const { getMorphItems, result } = setup({
      initialMorphItems: [initialMorphItem],
      onChange,
    });

    let selectionResult: Promise<void> = Promise.resolve();
    let deselectionResult: Promise<void> = Promise.resolve();
    act(() => {
      selectionResult = result.current.handleChange({
        ...initialMorphItem,
        isSelected: true,
      });
      deselectionResult = result.current.handleChange(initialMorphItem);
    });

    expect(getMorphItems()[0].isSelected).toBe(false);

    await act(async () => {
      selection.resolve();
      await selectionResult;
    });
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
    await act(async () => await deselectionResult);

    expect(getMorphItems()[0].isSelected).toBe(true);
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledTimes(1);
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      apolloError: deselectionError,
    });
  });

  it('rolls back and reports a synchronous persistence error', async () => {
    const error = new Error('Synchronous failure');
    const initialMorphItem = createMorphItem('record-id', false);
    const { getMorphItems, result } = setup({
      initialMorphItems: [initialMorphItem],
      onChange: () => {
        throw error;
      },
    });

    await act(async () => {
      await result.current.handleChange({
        ...initialMorphItem,
        isSelected: true,
      });
    });

    expect(getMorphItems()[0].isSelected).toBe(false);
    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      apolloError: error,
    });
  });

  it('does not repopulate picker state cleared while a change is pending', async () => {
    const change = createDeferred();
    const initialMorphItem = createMorphItem('record-id', false);
    const { getMorphItems, resetMorphItems, result } = setup({
      initialMorphItems: [initialMorphItem],
      onChange: () => change.promise,
    });

    let changeResult: Promise<void> = Promise.resolve();
    act(() => {
      changeResult = result.current.handleChange({
        ...initialMorphItem,
        isSelected: true,
      });
      resetMorphItems();
    });

    await act(async () => {
      change.reject(new Error('Failed after close'));
      await changeResult;
    });

    expect(getMorphItems()).toEqual([]);
  });
});
