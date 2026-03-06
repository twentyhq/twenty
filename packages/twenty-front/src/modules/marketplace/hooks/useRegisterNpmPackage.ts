import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { REGISTER_NPM_PACKAGE } from '~/modules/marketplace/graphql/mutations/registerNpmPackage';

export const useRegisterNpmPackage = () => {
  const [registerNpmPackageMutation] = useMutation(REGISTER_NPM_PACKAGE);
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [isRegistering, setIsRegistering] = useState(false);

  const register = async (params: {
    packageName: string;
  }): Promise<boolean> => {
    setIsRegistering(true);

    try {
      const result = await registerNpmPackageMutation({
        variables: { packageName: params.packageName },
      });

      const registration = result.data?.registerNpmPackage;

      if (!isDefined(registration)) {
        enqueueErrorSnackBar({ message: t`Registration failed.` });

        return false;
      }

      enqueueSuccessSnackBar({
        message: t`Package registered successfully.`,
      });

      return true;
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Failed to register npm package.`,
      });

      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  return { register, isRegistering };
};
