import { createContext } from 'react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

type RecordBoardContextProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  selectFieldMetadataItem: FieldMetadataItem;
  createOneRecord: (recordInput: Partial<ObjectRecord>) => void;
  updateOneRecord: ({
    idToUpdate,
    updateOneRecordInput,
  }: {
    idToUpdate: string;
    updateOneRecordInput: Partial<Omit<ObjectRecord, 'id'>>;
  }) => void;
  deleteOneRecord: (idToDelete: string) => Promise<unknown>;
  recordBoardId: string;
  objectPermissions: ObjectRecordsPermissions;
};

export const RecordBoardContext = createContext<RecordBoardContextProps>(
  {} as RecordBoardContextProps,
);
