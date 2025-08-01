import { createContext } from 'react';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectPermission } from '~/generated/graphql';

type RecordBoardContextProps = {
  objectMetadataItem: ObjectMetadataItem;
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
  objectPermissions: ObjectPermission;
};

export const RecordBoardContext = createContext<RecordBoardContextProps>(
  {} as RecordBoardContextProps,
);
