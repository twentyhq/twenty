import { createContext } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type RecordTableContextProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const RecordTableContext = createContext<RecordTableContextProps>(
  {} as RecordTableContextProps,
);
