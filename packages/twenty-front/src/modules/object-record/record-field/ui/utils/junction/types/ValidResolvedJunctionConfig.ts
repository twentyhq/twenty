import { type ValidJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidJunctionConfig';

export type ValidResolvedJunctionConfig = ValidJunctionConfig & {
  direction: 'forward' | 'reverse';
  isValid: true;
};
