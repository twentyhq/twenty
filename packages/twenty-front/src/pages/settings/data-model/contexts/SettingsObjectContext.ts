import { createContext } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type SettingsObjectContextProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const SettingsObjectContext = createContext<SettingsObjectContextProps>(
  {} as SettingsObjectContextProps,
);
