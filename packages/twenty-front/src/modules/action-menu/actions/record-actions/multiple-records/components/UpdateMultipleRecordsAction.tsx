import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useOpenUpdateMultipleRecordsPageInCommandMenu } from '@/command-menu/hooks/useOpenUpdateMultipleRecordsPageInCommandMenu';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';

export const UpdateMultipleRecordsAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { openUpdateMultipleRecordsPageInCommandMenu } =
    useOpenUpdateMultipleRecordsPageInCommandMenu({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  const handleClick = () => {
    openUpdateMultipleRecordsPageInCommandMenu();
  };

  return <ActionDisplay onClick={handleClick} />;
};
