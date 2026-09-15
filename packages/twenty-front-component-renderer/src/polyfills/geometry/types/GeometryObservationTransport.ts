import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';

export type GeometryObservationTransport = Pick<
  FrontComponentHostThreadExports,
  'observeElementGeometry' | 'unobserveElementGeometry'
>;
