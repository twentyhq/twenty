import { type HostOutsidePressController } from '@/host/events/types/HostOutsidePressController';

export const createHostOutsidePressControllerStub =
  (): HostOutsidePressController => ({
    observeOutsidePresses: jest.fn(),
    unobserveOutsidePresses: jest.fn(),
    setPressEventTransport: jest.fn(),
    forwardUnhandledOwnedPress: jest.fn(),
    reset: jest.fn(),
  });
