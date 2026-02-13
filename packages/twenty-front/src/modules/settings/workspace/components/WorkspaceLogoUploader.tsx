import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ImageInput } from '@/ui/input/components/ImageInput';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { buildSignedPath } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  useUpdateWorkspaceMutation,
  useUploadWorkspaceLogoLegacyMutation,
  useUploadWorkspaceLogoMutation,
} from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const WorkspaceLogoUploader = () => {
  const isCorePictureMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_CORE_PICTURE_MIGRATED,
  );
  const [uploadLogoLegacy] = useUploadWorkspaceLogoLegacyMutation();
  const [uploadLogo] = useUploadWorkspaceLogoMutation();
  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const onUpload = async (file: File) => {
    if (isUndefinedOrNull(file)) {
      return;
    }
    if (!currentWorkspace?.id) {
      throw new Error('Workspace id not found');
    }

    if (isCorePictureMigrated) {
      await uploadLogo({
        variables: {
          file,
        },
        onCompleted: (data) => {
          setCurrentWorkspace({
            ...currentWorkspace,
            logo: data.uploadWorkspaceLogo.url,
          });
        },
      });
    } else {
      await uploadLogoLegacy({
        variables: {
          file,
        },
        onCompleted: (data) => {
          setCurrentWorkspace({
            ...currentWorkspace,
            logo: buildSignedPath(data.uploadWorkspaceLogoLegacy),
          });
        },
      });
    }
  };

  const onRemove = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('Workspace id not found');
    }
    await updateWorkspace({
      variables: {
        input: {
          logo: null,
        },
      },
      onCompleted: () => {
        setCurrentWorkspace({
          ...currentWorkspace,
          logo: null,
        });
      },
    });
  };

  return (
    <ImageInput
      picture={currentWorkspace?.logo}
      onUpload={onUpload}
      onRemove={onRemove}
    />
  );
};
