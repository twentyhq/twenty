import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
} from 'react';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SavedResponseRecord = ObjectRecord & {
  name: string;
  subject: string | null;
  body: string | null;
  category: string | null;
};

export type SavedResponse = {
  id: string;
  name: string;
  subject: string | null;
  body: string;
  category: string | null;
};

export type SavedResponseDataSource = {
  getSavedResponses: () => readonly SavedResponse[];
  loading: boolean;
};

const EMPTY_SAVED_RESPONSE_DATA_SOURCE: SavedResponseDataSource = {
  getSavedResponses: () => [],
  loading: false,
};

const SavedResponseDataSourceContext = createContext<SavedResponseDataSource>(
  EMPTY_SAVED_RESPONSE_DATA_SOURCE,
);

const SavedResponseQueryProvider = ({ children }: { children: ReactNode }) => {
  const { records, loading } = useFindManyRecords<SavedResponseRecord>({
    objectNameSingular: 'savedResponse',
    recordGqlFields: {
      id: true,
      name: true,
      subject: true,
      body: true,
      category: true,
    },
  });

  const getSavedResponses = useCallback(
    () =>
      records.map(({ id, name, subject, body, category }) => ({
        id,
        name,
        subject,
        body: body ?? '',
        category,
      })),
    [records],
  );

  return createElement(
    SavedResponseDataSourceContext.Provider,
    { value: { getSavedResponses, loading } },
    children,
  );
};

export const SavedResponseDataSourceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const hasSavedResponseObject = objectMetadataItems.some(
    (objectMetadataItem) => objectMetadataItem.nameSingular === 'savedResponse',
  );

  if (!hasSavedResponseObject) {
    return createElement(
      SavedResponseDataSourceContext.Provider,
      { value: EMPTY_SAVED_RESPONSE_DATA_SOURCE },
      children,
    );
  }

  return createElement(SavedResponseQueryProvider, undefined, children);
};

export const useSavedResponseDataSource = (): SavedResponseDataSource =>
  useContext(SavedResponseDataSourceContext);
