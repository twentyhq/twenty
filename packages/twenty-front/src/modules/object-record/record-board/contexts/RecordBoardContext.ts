import { createContext } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type RecordBoardContextProps = {
  objectMetadataItem: ObjectMetadataItem;
  createOneRecord: (recordInput: Partial<ObjectRecord>) => void;
  updateOneRecord: ({
    idToUpdate,
    updateOneRecordInput,
  }: {
    idToUpdate: string;
    updateOneRecordInput: Partial<Omit<ObjectRecord, 'id'>>;
  }) => void;
  deleteOneRecord: (idToDelete: string) => Promise<unknown>;
};

export const RecordBoardContext = createContext<RecordBoardContextProps>(
  {} as RecordBoardContextProps,
);
