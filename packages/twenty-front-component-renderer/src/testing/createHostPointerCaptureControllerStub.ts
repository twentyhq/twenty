import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';

export const createHostPointerCaptureControllerStub =
  (): HostPointerCaptureController => ({
    startPointerCapture: jest.fn(),
    claimPointerEventForwarding: jest.fn(() => true),
    setPushCapturedPointerEvent: jest.fn(),
    reset: jest.fn(),
  });
