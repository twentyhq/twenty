import { createContext } from 'react';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

type SettingsObjectFieldContextProps = {
  fieldMetadataItem: FieldMetadataItem;
};

export const SettingsObjectFieldContext =
  createContext<SettingsObjectFieldContextProps>(
    {} as SettingsObjectFieldContextProps,
  );
