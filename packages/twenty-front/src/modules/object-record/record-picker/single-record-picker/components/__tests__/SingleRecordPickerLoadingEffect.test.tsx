import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';

import { SingleRecordPickerLoadingEffect } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerLoadingEffect';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerShouldShowSkeletonComponentState';

const instanceId = 'single-record-picker-loading-effect-test';

const renderLoadingEffect = ({
  loading,
  isSkeletonShown,
}: {
  loading: boolean;
  isSkeletonShown: boolean;
}) => {
  const store = createStore();
  const skeletonAtom =
    singleRecordPickerShouldShowSkeletonComponentState.atomFamily({
      instanceId,
    });

  store.set(skeletonAtom, isSkeletonShown);

  const renderEffect = (currentLoading: boolean) => (
    <JotaiProvider store={store}>
      <SingleRecordPickerComponentInstanceContext.Provider
        value={{ instanceId }}
      >
        <SingleRecordPickerLoadingEffect loading={currentLoading} />
      </SingleRecordPickerComponentInstanceContext.Provider>
    </JotaiProvider>
  );

  const { rerender } = render(renderEffect(loading));

  return {
    isSkeletonShown: () => store.get(skeletonAtom),
    setLoading: (nextLoading: boolean) => rerender(renderEffect(nextLoading)),
  };
};

describe('SingleRecordPickerLoadingEffect', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('hides the skeleton set on open when results are already available', () => {
    const { isSkeletonShown } = renderLoadingEffect({
      loading: false,
      isSkeletonShown: true,
    });

    expect(isSkeletonShown()).toBe(false);
  });

  it('shows the skeleton when loading lasts, then hides it once loaded', () => {
    const { isSkeletonShown, setLoading } = renderLoadingEffect({
      loading: true,
      isSkeletonShown: false,
    });

    act(() => jest.advanceTimersByTime(350));
    expect(isSkeletonShown()).toBe(true);

    setLoading(false);
    expect(isSkeletonShown()).toBe(false);
  });
});
