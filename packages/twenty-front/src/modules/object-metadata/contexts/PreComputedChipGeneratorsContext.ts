import { createContext } from 'react';

import { type RecordChipData } from '@/object-record/record-field/ui/types/RecordChipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ChipGeneratorPerObjectNameSingularPerFieldName = Record<
  string,
  Record<string, (record: ObjectRecord) => RecordChipData>
>;

export type IdentifierChipGeneratorPerObject = Partial<
  Record<string, (record: ObjectRecord) => RecordChipData>
>;

export type PreComputedChipGeneratorsContextProps = {
  chipGeneratorPerObjectPerField: ChipGeneratorPerObjectNameSingularPerFieldName;
  identifierChipGeneratorPerObject: IdentifierChipGeneratorPerObject;
};

export const PreComputedChipGeneratorsContext =
  createContext<PreComputedChipGeneratorsContextProps>(
    {} as PreComputedChipGeneratorsContextProps,
  );
