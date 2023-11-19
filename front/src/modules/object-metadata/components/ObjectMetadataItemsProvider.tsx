import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const { loading } = useFindManyObjectMetadataItems();

  return loading ? <></> : <>{children}</>;
};
