import { ApolloError } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

export const useHandleFindManyRecordsError = ({
  handleError,
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
  handleError?: (error?: Error) => void;
}) => {
  const { enqueueSnackBar } = useSnackBar();

  const handleFindManyRecordsError = (error: ApolloError) => {
    logError(
      `useFindManyRecords for "${objectMetadataItem.namePlural}" error : ` +
        error,
    );
    enqueueSnackBar(`${error.message}`, {
      variant: SnackBarVariant.Error,
    });
    handleError?.(error);
  };

  return {
    handleFindManyRecordsError,
  };
};
