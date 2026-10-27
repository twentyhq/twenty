import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';

export type OutsidePressObservationTransport = Pick<
  FrontComponentHostThreadExports,
  'observeOutsidePresses' | 'unobserveOutsidePresses'
>;
