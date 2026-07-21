import { render } from '@testing-library/react';

import { RecordIndexLoadBaseOnContextStoreEffect } from '@/object-record/record-index/components/RecordIndexLoadBaseOnContextStoreEffect';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

jest.mock(
  '@/object-record/record-index/hooks/useLoadRecordIndexStates',
  () => ({
    useLoadRecordIndexStates: jest.fn(),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: jest.fn(),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: jest.fn(),
  }),
);
jest.mock(
  '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow',
  () => ({
    useContextStoreObjectMetadataItemOrThrow: jest.fn(),
  }),
);
jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: jest.fn(),
}));

const useLoadRecordIndexStatesMock = jest.requireMock(
  '@/object-record/record-index/hooks/useLoadRecordIndexStates',
).useLoadRecordIndexStates;
const useAtomComponentStateValueMock = jest.requireMock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
).useAtomComponentStateValue;
const useAtomFamilySelectorValueMock = jest.requireMock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
).useAtomFamilySelectorValue;
const useContextStoreObjectMetadataItemOrThrowMock = jest.requireMock(
  '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow',
).useContextStoreObjectMetadataItemOrThrow;
const useIsFeatureEnabledMock = jest.requireMock(
  '@/workspace/hooks/useIsFeatureEnabled',
).useIsFeatureEnabled;

describe('RecordIndexLoadBaseOnContextStoreEffect', () => {
  const loadRecordIndexStates = jest.fn();
  const view = { id: 'view-id' };
  const objectMetadataItem = { id: 'object-metadata-id' };

  beforeEach(() => {
    jest.clearAllMocks();
    useLoadRecordIndexStatesMock.mockReturnValue({ loadRecordIndexStates });
    useAtomComponentStateValueMock.mockReturnValue('view-id');
    useAtomFamilySelectorValueMock.mockReturnValue(view);
    useContextStoreObjectMetadataItemOrThrowMock.mockReturnValue({
      objectMetadataItem,
    });
    useIsFeatureEnabledMock.mockReturnValue(false);
  });

  it('reloads the persisted view state when the week-view flag changes', () => {
    const { rerender } = render(<RecordIndexLoadBaseOnContextStoreEffect />);

    expect(loadRecordIndexStates).toHaveBeenCalledTimes(1);
    expect(loadRecordIndexStates).toHaveBeenLastCalledWith(
      view,
      objectMetadataItem,
    );

    rerender(<RecordIndexLoadBaseOnContextStoreEffect />);

    expect(loadRecordIndexStates).toHaveBeenCalledTimes(1);

    useIsFeatureEnabledMock.mockReturnValue(true);
    rerender(<RecordIndexLoadBaseOnContextStoreEffect />);

    expect(loadRecordIndexStates).toHaveBeenCalledTimes(2);
    expect(useIsFeatureEnabledMock).toHaveBeenCalledWith(
      FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
    );
  });
});
