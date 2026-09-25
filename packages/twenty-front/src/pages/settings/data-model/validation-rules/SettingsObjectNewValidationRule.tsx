import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsValidationRuleForm } from '@/validation-rules/components/SettingsValidationRuleForm';
import { EMPTY_VALIDATION_RULE_FORM_VALUES } from '@/validation-rules/constants/EmptyValidationRuleFormValues';
import { useValidationRuleMutations } from '@/validation-rules/hooks/useValidationRuleMutations';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { getValidationRuleSaveErrorMessage } from '@/validation-rules/utils/getValidationRuleSaveErrorMessage';
import { isValidationRuleFormSubmittable } from '@/validation-rules/utils/isValidationRuleFormSubmittable';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { NotFound } from '~/pages/not-found/NotFound';

const OBJECT_SETTINGS_TAB_HASH = 'settings';

const SettingsObjectNewValidationRuleForm = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { createValidationRule, isSaving } = useValidationRuleMutations({
    objectMetadataId: objectMetadataItem.id,
  });

  const [values, setValues] = useState<ValidationRuleFormValues>(
    EMPTY_VALIDATION_RULE_FORM_VALUES,
  );

  const fields = buildValidationRuleFieldDescriptors({
    objectMetadataItem,
    objectMetadataItems,
  });

  const objectNamePlural = objectMetadataItem.namePlural;

  const handleSave = async () => {
    try {
      await createValidationRule({
        variables: {
          input: { objectMetadataId: objectMetadataItem.id, ...values },
        },
      });
      enqueueToast({ variant: 'success', children: t`Rule created.` });
      navigate(
        SettingsPath.ObjectDetail,
        { objectNamePlural },
        undefined,
        undefined,
        OBJECT_SETTINGS_TAB_HASH,
      );
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children:
          getValidationRuleSaveErrorMessage(error) ??
          t`Failed to create the rule.`,
      });
    }
  };

  return (
    <SettingsPageLayout
      title={t`New rule`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: <Trans>Objects</Trans>,
          href: getSettingsPath(SettingsPath.Objects),
        },
        {
          children: objectMetadataItem.labelPlural,
          href: getSettingsPath(
            SettingsPath.ObjectDetail,
            { objectNamePlural },
            undefined,
            OBJECT_SETTINGS_TAB_HASH,
          ),
        },
        { children: <Trans>New rule</Trans> },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onSave={handleSave}
          onCancel={() =>
            navigate(
              SettingsPath.ObjectDetail,
              { objectNamePlural },
              undefined,
              undefined,
              OBJECT_SETTINGS_TAB_HASH,
            )
          }
          isSaveDisabled={!isValidationRuleFormSubmittable({ values, fields })}
          isLoading={isSaving}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsValidationRuleForm
          objectMetadataItem={objectMetadataItem}
          fields={fields}
          values={values}
          onChange={setValues}
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};

export const SettingsObjectNewValidationRule = () => {
  const { objectNamePlural = '' } = useParams();
  const { findObjectMetadataItemByNamePlural } =
    useFilteredObjectMetadataItems();

  const objectMetadataItem =
    findObjectMetadataItemByNamePlural(objectNamePlural);

  if (!isDefined(objectMetadataItem)) {
    return <NotFound />;
  }

  return (
    <SettingsObjectNewValidationRuleForm
      objectMetadataItem={objectMetadataItem}
    />
  );
};
