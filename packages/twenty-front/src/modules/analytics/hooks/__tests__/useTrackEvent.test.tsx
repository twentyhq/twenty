import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useTrackEvent } from '../useTrackEvent';

const mockCreateEventMutation = jest.fn();

jest.mock('~/generated/graphql', () => ({
  useCreateEventMutation: () => [mockCreateEventMutation],
}));

describe('useTrackEvent', () => {
  it('should call useEventTracker with the correct arguments', async () => {
    const eventType = 'exampleType';
    const eventData = { location: { pathname: '/examplePath' } };
    renderHook(() => useTrackEvent(eventType, eventData), {
      wrapper: RecoilRoot,
    });
    expect(mockCreateEventMutation).toHaveBeenCalledTimes(1);
    expect(mockCreateEventMutation).toHaveBeenCalledWith({
      variables: { type: eventType, data: eventData },
    });
  });
});
