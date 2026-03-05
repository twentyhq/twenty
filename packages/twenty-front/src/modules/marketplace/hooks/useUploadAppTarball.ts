import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { UPLOAD_APP_TARBALL } from '~/modules/marketplace/graphql/mutations/uploadAppTarball';

type UploadResult =
  | {
      success: true;
      universalIdentifier: string;
    }
  | {
      success: false;
    };

export const useUploadAppTarball = () => {
  const [uploadAppTarball] = useMutation(UPLOAD_APP_TARBALL);
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);

    try {
      const result = await uploadAppTarball({
        variables: { file },
      });

      const registration = result.data?.uploadAppTarball;

      if (!isDefined(registration?.universalIdentifier)) {
        enqueueErrorSnackBar({ message: t`Upload failed.` });

        return { success: false };
      }

      return {
        success: true,
        universalIdentifier: registration.universalIdentifier,
      };
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to upload tarball.`,
      });

      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
};
