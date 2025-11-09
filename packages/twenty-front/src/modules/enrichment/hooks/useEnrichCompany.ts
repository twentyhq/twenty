import { useMutation } from '@apollo/client';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

import { ENRICH_COMPANY } from '../graphql/mutations/enrichCompany';

export type EnrichCompanyInput = {
  companyId: string;
  companyName: string;
  fieldsToEnrich?: string[];
};

export type EnrichCompanySource = {
  name: string;
  url: string;
  snippet?: string;
};

export type EnrichCompanyResult = {
  success: boolean;
  description?: string;
  sources?: EnrichCompanySource[];
  error?: string;
};

export const useEnrichCompany = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const apolloCoreClient = useApolloCoreClient();

  const [enrichCompanyMutation, { loading }] = useMutation<
    { enrichCompany: EnrichCompanyResult },
    { input: EnrichCompanyInput }
  >(ENRICH_COMPANY, {
    client: apolloCoreClient,
  });

  const enrichCompany = async (input: EnrichCompanyInput) => {
    try {
      const result = await enrichCompanyMutation({
        variables: { input },
      });

      if (result.data?.enrichCompany.success === true) {
        await apolloCoreClient.refetchQueries({
          include: 'active',
        });

        enqueueSuccessSnackBar({
          message: 'Company enriched successfully!',
        });
        return result.data.enrichCompany;
      } else {
        enqueueErrorSnackBar({
          message:
            result.data?.enrichCompany.error || 'Failed to enrich company',
        });
        return result.data?.enrichCompany;
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message: 'An error occurred while enriching the company',
      });
      throw error;
    }
  };

  return {
    enrichCompany,
    loading,
  };
};
