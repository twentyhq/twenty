import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const createGeometryTrackerStub = (): GeometryTracker => ({
  registerNode: jest.fn(),
  unregisterNode: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn(),
  setRoot: jest.fn(),
  setPushGeometryUpdates: jest.fn(),
  getViewportGeometry: jest.fn<ViewportGeometrySnapshot, []>(),
  reset: jest.fn(),
});
