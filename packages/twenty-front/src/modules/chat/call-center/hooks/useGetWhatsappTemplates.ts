import { GET_WHATSAPP_TEMPLATES } from '@/chat/call-center/graphql/query/getWhatsappTemplates';
import { WhatsappTemplatesResponse } from '@/chat/call-center/types/WhatsappTemplate';
import { useQuery } from '@apollo/client';

type GetWhatsappTemplatesReturn = {
  data: WhatsappTemplatesResponse | null;
  loading: boolean;
};

export const useGetWhatsappTemplates = (
  integrationId: string,
): GetWhatsappTemplatesReturn => {
  const { data: whatsappTemplatesData, loading } = useQuery(
    GET_WHATSAPP_TEMPLATES,
    {
      variables: { integrationId },
    },
  );

  return {
    data: whatsappTemplatesData?.getWhatsappTemplates || null,
    loading,
  };
};
