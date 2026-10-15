import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SettingsValidationRuleCreateForm } from '@/validation-rules/components/SettingsValidationRuleCreateForm';
import { useValidationRuleSettingsObjectMetadataItem } from '@/validation-rules/hooks/useValidationRuleSettingsObjectMetadataItem';
import { NotFound } from '~/pages/not-found/NotFound';

export const SettingsObjectValidationRuleNew = () => {
  const { objectNamePlural = '' } = useParams();
  const objectMetadataItem = useValidationRuleSettingsObjectMetadataItem({
    objectNamePlural,
  });

  if (!isDefined(objectMetadataItem)) {
    return <NotFound />;
  }

  return (
    <SettingsValidationRuleCreateForm objectMetadataItem={objectMetadataItem} />
  );
};
