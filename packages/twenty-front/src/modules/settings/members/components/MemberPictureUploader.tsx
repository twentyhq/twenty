import { useState } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { UPLOAD_WORKSPACE_MEMBER_PROFILE_PICTURE } from '@/settings/members/graphql/mutations/uploadWorkspaceMemberProfilePicture';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { useMutation } from '@apollo/client';
import { buildSignedPath, isDefined } from 'twenty-shared/utils';

type MemberPictureUploaderProps = {
  memberId: string;
  avatarUrl?: string | null;
  onAvatarUpdated: (url: string | null) => void;
};

export const MemberPictureUploader = ({
  memberId,
  avatarUrl,
  onAvatarUpdated,
}: MemberPictureUploaderProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [uploadPicture] = useMutation(UPLOAD_WORKSPACE_MEMBER_PROFILE_PICTURE);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const { data } = await uploadPicture({
        variables: { file },
      });
      const signedFile = data?.uploadWorkspaceMemberProfilePicture;
      if (!isDefined(signedFile)) {
        throw new Error('Avatar upload failed');
      }

      await updateOneRecord({
        idToUpdate: memberId,
        updateOneRecordInput: { avatarUrl: signedFile.path },
      });

      onAvatarUpdated(buildSignedPath(signedFile));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upload picture';
      enqueueErrorSnackBar({ message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      await updateOneRecord({
        idToUpdate: memberId,
        updateOneRecordInput: { avatarUrl: '' },
      });
      onAvatarUpdated(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to remove picture';
      enqueueErrorSnackBar({ message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ImageInput
      picture={avatarUrl}
      onUpload={handleUpload}
      onRemove={handleRemove}
      onAbort={() => setIsUploading(false)}
      isUploading={isUploading}
      errorMessage={errorMessage}
    />
  );
};
