import { useApolloClient } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';
import { Toggle } from '@/ui/input/components/Toggle';

export const ToggleField = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const apolloClient = useApolloClient();
  const { updateOneMutation } = useFindOneObjectMetadataItem({
    objectNameSingular: 'workspaceMemberV2',
  });

  const handleChange = async (value: boolean) => {
    try {
      await apolloClient.mutate({
        mutation: updateOneMutation,
        variables: {
          idToUpdate: currentWorkspaceMember?.id,
          input: {
            allowImpersonation: value,
          },
        },
      });
      setCurrentWorkspaceMember(
        (current) =>
          ({
            ...current,
            allowImpersonation: value,
          } as any),
      );
    } catch (err: any) {
      enqueueSnackBar(err?.message, {
        variant: 'error',
      });
    }
  };

  return (
    <Toggle
      value={currentWorkspaceMember?.allowImpersonation}
      onChange={handleChange}
    />
  );
};
