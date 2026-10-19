import { activeEmailCampaignIdState } from '@/activities/emails/states/activeEmailCampaignIdState';
import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { findTemplateVariableFallbacksByName } from '@/advanced-text-editor/utils/findTemplateVariableFallbacksByName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import {
  formatTemplateVariableWithFallback,
  listCampaignVariablesForFields,
} from 'twenty-shared/utils';

export const useCampaignEmailEditorVariables = () => {
  const { t } = useLingui();
  const { objectMetadataItem: personObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Person,
    });
  const activeEmailCampaignId = useAtomStateValue(activeEmailCampaignIdState);
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);
  const subject = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: activeEmailCampaignId ?? '',
    fieldName: 'subject',
  });

  const variables = [
    ...listCampaignVariablesForFields(personObjectMetadataItem.fields, {
      firstName: t`First name`,
      lastName: t`Last name`,
    }).map(({ label, name }) => ({ label, name })),
    { label: t`Full name`, name: 'fullName' },
    { label: t`Person ID`, name: 'personId' },
  ];

  const findExistingFallbacksByName = () =>
    findTemplateVariableFallbacksByName({
      rawContent: isString(subject) ? subject : '',
      editorContent: activeEmailEditor?.getJSON(),
    });

  const formatTemplateVariableWithExistingFallback = (name: string) =>
    formatTemplateVariableWithFallback({
      name,
      fallback: findExistingFallbacksByName().get(name),
    });

  const listVariablesWithExistingFallback = () => {
    const existingFallbacksByName = findExistingFallbacksByName();

    return variables.map(({ label, name }) => ({
      label,
      name,
      rawTemplateVariable: formatTemplateVariableWithFallback({
        name,
        fallback: existingFallbacksByName.get(name),
      }),
    }));
  };

  return {
    variables,
    formatTemplateVariableWithExistingFallback,
    listVariablesWithExistingFallback,
  };
};
