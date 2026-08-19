import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { listCampaignVariablesForFields } from 'twenty-shared/utils';

export const useCampaignEmailEditorVariables = () => {
  const { t } = useLingui();
  const { objectMetadataItem: personObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Person,
    });

  const variables = [
    ...listCampaignVariablesForFields(personObjectMetadataItem.fields).map(
      ({ label, name }) => ({ label, value: `{{${name}}}` }),
    ),
    { label: t`Full name`, value: '{{fullName}}' },
    { label: t`Person ID`, value: '{{personId}}' },
  ];

  return { variables };
};
