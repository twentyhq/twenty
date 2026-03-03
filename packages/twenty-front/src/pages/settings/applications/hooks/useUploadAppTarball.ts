import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type UploadResult =
  | {
      success: true;
      universalIdentifier: string;
    }
  | {
      success: false;
    };

export const useUploadAppTarball = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File): Promise<UploadResult> => {
    setIsUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          '',
        ),
      );

      const tokenPair = getTokenPair();

      if (!isDefined(tokenPair)) {
        enqueueErrorSnackBar({
          message: t`Authentication required.`,
        });

        return { success: false };
      }

      const token = tokenPair.accessOrWorkspaceAgnosticToken?.token;

      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/api/app-registrations/upload-tarball`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tarball: base64 }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const status = response.status;
        const errorMessage =
          errorBody.messages?.[0] ??
          errorBody.message ??
          t`Upload failed (${status})`;

        enqueueErrorSnackBar({ message: errorMessage });

        return { success: false };
      }

      const registration = await response.json();

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
