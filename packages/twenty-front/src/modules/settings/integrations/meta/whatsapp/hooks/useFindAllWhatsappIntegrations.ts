import { useQuery } from '@apollo/client';

import { FindWhatsappIntegration } from '@/settings/integrations/meta/whatsapp/types/FindWhatsappIntegrationInput';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { GET_ALL_WHATSAPP_INTEGRATIONS } from '../graphql/query/whatsappIntegrationByWorkspace';

type FindAllWhatsappIntegrations = {
  whatsappIntegrations: FindWhatsappIntegration[];
  refetchWhatsapp: () => void;
  loading: boolean;
};

export const useFindAllWhatsappIntegrations =
  (): FindAllWhatsappIntegrations => {
    const { enqueueSnackBar } = useSnackBar();

    const {
      data,
      refetch: refetchWhatsapp,
      loading,
    } = useQuery(GET_ALL_WHATSAPP_INTEGRATIONS, {
      onError: (error) => {
        enqueueSnackBar(error.message, {
          variant: SnackBarVariant.Error,
        });
      },
    });

    return {
      whatsappIntegrations: data?.whatsappIntegrationsByWorkspace,
      refetchWhatsapp,
      loading,
    };
  };
