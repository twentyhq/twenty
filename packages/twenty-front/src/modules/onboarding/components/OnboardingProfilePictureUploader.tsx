import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateWorkspaceMemberSettings } from '@/settings/profile/hooks/useUpdateWorkspaceMemberSettings';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';
import { FileFolder } from 'twenty-shared/types';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { IconUserCircle } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { UploadWorkspaceMemberProfilePictureDocument } from '~/generated-metadata/graphql';

const StyledUploader = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.rounded};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.light};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  overflow: hidden;
  padding: 0;
  width: ${themeCssVariables.spacing[8]};
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledHiddenFileInput = styled.input`
  display: none;
`;

type OnboardingProfilePictureUploaderProps = {
  workspaceMemberId: string;
};

export const OnboardingProfilePictureUploader = ({
  workspaceMemberId,
}: OnboardingProfilePictureUploaderProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const setCurrentWorkspaceMember = useSetAtomState(
    currentWorkspaceMemberState,
  );
  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();
  const [uploadPicture] = useMutation(
    UploadWorkspaceMemberProfilePictureDocument,
  );
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      const { data } = await uploadPicture({ variables: { file } });

      const uploadedFile = data?.uploadWorkspaceMemberProfilePicture;
      if (!isDefined(uploadedFile)) {
        throw new Error('Avatar upload failed');
      }

      const newAvatarUrl = `${REACT_APP_SERVER_BASE_URL}/file/${FileFolder.CorePicture}/${uploadedFile.id}`;

      await updateWorkspaceMemberSettings({
        workspaceMemberId,
        update: { avatarUrl: newAvatarUrl },
      });

      setCurrentWorkspaceMember((previous) =>
        previous
          ? { ...previous, avatarUrl: uploadedFile.url ?? newAvatarUrl }
          : previous,
      );
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error ? error.message : t`Failed to upload picture`,
      });
    }
  };

  const avatarUrl = currentWorkspaceMember?.avatarUrl;
  const pictureUri = isNonEmptyString(avatarUrl)
    ? getImageAbsoluteURI({
        imageUrl: avatarUrl,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : null;

  return (
    <>
      <StyledUploader
        type="button"
        aria-label={t`Upload profile picture`}
        onClick={() => hiddenFileInputRef.current?.click()}
      >
        {isNonEmptyString(pictureUri) ? (
          <StyledImage src={pictureUri} alt="" />
        ) : (
          <IconUserCircle
            size={theme.icon.size.md}
            color={themeCssVariables.font.color.light}
          />
        )}
      </StyledUploader>
      <StyledHiddenFileInput
        type="file"
        ref={hiddenFileInputRef}
        accept="image/jpeg, image/png, image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (isDefined(file)) {
            void handleUpload(file);
          }
        }}
      />
    </>
  );
};
