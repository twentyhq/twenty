import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SettingsValidationRuleEditForm } from '@/validation-rules/components/SettingsValidationRuleEditForm';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { useValidationRuleSettingsObjectMetadataItem } from '@/validation-rules/hooks/useValidationRuleSettingsObjectMetadataItem';
import { NotFound } from '~/pages/not-found/NotFound';

export const SettingsObjectValidationRuleEdit = () => {
  const { validationRuleId = '' } = useParams();
  const objectMetadataItem = useValidationRuleSettingsObjectMetadataItem();

  const { validationRules, loading } = useValidationRules({
    objectMetadataId: objectMetadataItem?.id ?? '',
  });

  if (!isDefined(objectMetadataItem)) {
    return <NotFound />;
  }

  const validationRule = validationRules.find(
    (candidate) => candidate.id === validationRuleId,
  );

  if (!isDefined(validationRule)) {
    return loading ? null : <NotFound />;
  }

  return (
    <SettingsValidationRuleEditForm
      key={validationRule.id}
      objectMetadataItem={objectMetadataItem}
      validationRule={validationRule}
    />
  );
};
