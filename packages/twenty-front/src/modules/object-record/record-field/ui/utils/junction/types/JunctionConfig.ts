import { type ValidJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidJunctionConfig';

type InvalidJunctionConfig = Pick<
  ValidJunctionConfig,
  'junctionObjectMetadata'
> & {
  targetFields: [];
  sourceField?: never;
  isMorphRelation: false;
  isValid: false;
};

export type JunctionConfig = ValidJunctionConfig | InvalidJunctionConfig;
