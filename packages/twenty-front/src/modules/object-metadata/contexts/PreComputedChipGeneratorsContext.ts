import { createContext } from 'react';

import { RecordChipData } from '@/object-record/record-field/types/RecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ChipGeneratorPerObjectNameSingularPerFieldName = Record<
  string,
  Record<string, (record: ObjectRecord) => RecordChipData>
>;

export type IdentifierChipGeneratorPerObject = Record<
  string,
  (record: ObjectRecord) => RecordChipData
>;

export type PreComputedChipGeneratorsContextProps = {
  chipGeneratorPerObjectPerField: ChipGeneratorPerObjectNameSingularPerFieldName;
  identifierChipGeneratorPerObject: IdentifierChipGeneratorPerObject;
};

export const PreComputedChipGeneratorsContext =
  createContext<PreComputedChipGeneratorsContextProps>(
    {} as PreComputedChipGeneratorsContextProps,
  );
