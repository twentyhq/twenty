import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SettingsValidationRuleEditForm } from '@/validation-rules/components/SettingsValidationRuleEditForm';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { NotFound } from '~/pages/not-found/NotFound';

export const SettingsObjectValidationRuleEdit = () => {
  const { objectNamePlural = '', validationRuleId = '' } = useParams();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  const { validationRules, loading } = useValidationRules({
    objectMetadataId: objectMetadataItem?.id ?? '',
  });

  if (!isDefined(objectMetadataItem)) {
    return <NotFound />;
  }

  if (loading) {
    return null;
  }

  const validationRule = validationRules.find(
    (candidate) => candidate.id === validationRuleId,
  );

  if (!isDefined(validationRule)) {
    return <NotFound />;
  }

  return (
    <SettingsValidationRuleEditForm
      key={validationRule.id}
      objectMetadataItem={objectMetadataItem}
      validationRule={validationRule}
    />
  );
};
