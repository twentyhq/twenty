import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useTrackEvent } from '../useTrackEvent';

const mockTrackMutation = jest.fn();

jest.mock('~/generated/graphql', () => ({
  useTrackMutation: () => [mockTrackMutation],
}));

describe('useTrackEvent', () => {
  it('should call useEventTracker with the correct arguments', async () => {
    const eventType = 'exampleType';
    const eventData = { location: { pathname: '/examplePath' } };
    renderHook(() => useTrackEvent(eventType, eventData), {
      wrapper: RecoilRoot,
    });
    expect(mockTrackMutation).toHaveBeenCalledTimes(1);
    expect(mockTrackMutation).toHaveBeenCalledWith({
      variables: { type: eventType, data: eventData },
    });
  });
});
