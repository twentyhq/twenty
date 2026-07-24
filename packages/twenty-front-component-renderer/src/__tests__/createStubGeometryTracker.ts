import { type GeometryTracker } from '@/host/types/GeometryTracker';

export const createStubGeometryTracker = () =>
  ({
    registerNode: jest.fn(),
    unregisterNode: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
    setRoot: jest.fn(),
    setPushGeometryUpdates: jest.fn(),
    getViewportGeometry: jest.fn(),
    reset: jest.fn(),
  }) as unknown as GeometryTracker;
