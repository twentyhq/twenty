import { type HostPointerCaptureController } from '@/host/events/types/HostPointerCaptureController';

export const createHostPointerCaptureControllerStub =
  (): HostPointerCaptureController => ({
    startPointerCapture: jest.fn(),
    acceptWorkerPointerCapture: jest.fn(),
    releaseWorkerPointerCapture: jest.fn(),
    setTransport: jest.fn(),
    reset: jest.fn(),
  });
