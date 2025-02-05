import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { UPLOAD_FILE_TO_BUCKET } from '@/chat/graphql/mutation/uploadFileToBucket';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';

interface UploadFileToBucketInput {
  file: File;
  type: string;
  workspaceId?: string;
  isInternal?: boolean;
}

interface UploadFileToBucketReturn {
  uploadFileToBucket: (input: UploadFileToBucketInput) => Promise<string>;
}

export const useUploadFileToBucket = (): UploadFileToBucketReturn => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { enqueueSnackBar } = useSnackBar();

  const [uploadFileToBucketMutation] = useMutation(UPLOAD_FILE_TO_BUCKET, {
    onError: (error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const uploadFileToBucket = async ({
    file,
    type,
    isInternal,
  }: UploadFileToBucketInput): Promise<string> => {
    const { data } = await uploadFileToBucketMutation({
      variables: {
        file,
        type,
        workspaceId: currentWorkspace?.id,
        isInternal,
      },
    });

    return data.uploadFileToBucket;
  };

  return {
    uploadFileToBucket,
  };
};
