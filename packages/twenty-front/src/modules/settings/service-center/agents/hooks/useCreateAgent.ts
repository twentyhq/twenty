import { CREATE_AGENT } from '@/settings/service-center/agents/graphql/mutation/createAgent';
import { CreateAgentInput } from '@/settings/service-center/agents/types/CreateAgentInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client';

interface UserCreateAgentReturn {
  createAgent: (createInput: CreateAgentInput) => Promise<void>;
  data: any;
  loading: boolean;
  error: Error | undefined;
}

export const useCreateAgent = (): UserCreateAgentReturn => {
  const { enqueueSnackBar } = useSnackBar();

  const [createAgentMutation, { data, loading, error }] = useMutation(
    CREATE_AGENT,
    {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
      onCompleted: () => {
        enqueueSnackBar('Agent created successfully!', {
          variant: SnackBarVariant.Success,
        });
      },
    },
  );

  const createAgent = async (createInput: CreateAgentInput) => {
    try {
      await createAgentMutation({
        variables: { createInput },
      });
    } catch (err) {
      enqueueSnackBar('Agent creation error', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return {
    createAgent,
    data,
    loading,
    error,
  };
};
