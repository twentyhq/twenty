import { useMutation, useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { DpaDocumentPreview } from '@/settings/legal/components/DpaDocumentPreview';
import { DpaNotice } from '@/settings/legal/components/DpaNotice';
import { GENERATE_SIGNED_DPA } from '@/settings/legal/graphql/mutations/generateSignedDpa';
import { GET_DPA_AGREEMENTS } from '@/settings/legal/graphql/queries/getDpaAgreements';
import { GET_DPA_PREVIEW } from '@/settings/legal/graphql/queries/getDpaPreview';
import {
  type DpaDocument,
  type GenerateSignedDpaResult,
} from '@/settings/legal/types/Dpa';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsLegalDpaNew = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  // DPA operations live on the core (/graphql) schema, not the default /metadata client.
  const apolloCoreClient = useApolloCoreClient();

  const [customerLegalEntityName, setCustomerLegalEntityName] = useState('');
  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryTitle, setSignatoryTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: previewData, loading: previewLoading } = useQuery<{
    dpaPreview: DpaDocument;
  }>(GET_DPA_PREVIEW, { client: apolloCoreClient });

  const [generateSignedDpa] = useMutation<{
    generateSignedDpa: GenerateSignedDpaResult;
  }>(GENERATE_SIGNED_DPA, {
    client: apolloCoreClient,
    refetchQueries: [{ query: GET_DPA_AGREEMENTS }],
    awaitRefetchQueries: true,
  });

  const preview = previewData?.dpaPreview;

  const canSave =
    customerLegalEntityName.trim() !== '' &&
    signatoryName.trim() !== '' &&
    signatoryTitle.trim() !== '' &&
    !preview?.notice &&
    !isGenerating;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsGenerating(true);

    const trimmedLegalEntityName = customerLegalEntityName.trim();
    const trimmedSignatoryName = signatoryName.trim();
    const trimmedSignatoryTitle = signatoryTitle.trim();

    try {
      const { data } = await generateSignedDpa({
        variables: {
          input: {
            customerLegalEntityName: trimmedLegalEntityName,
            signatoryName: trimmedSignatoryName,
            signatoryTitle: trimmedSignatoryTitle,
          },
        },
      });

      const result = data?.generateSignedDpa;

      if (!result) {
        throw new Error('No result returned');
      }

      const safeLegalEntityName = trimmedLegalEntityName.replace(
        /[/\\:*?"<>|]+/g,
        '-',
      );

      await downloadFile(
        result.downloadUrl,
        `Twenty-DPA-${result.agreement.templateVersion}-${safeLegalEntityName}.pdf`,
      );

      enqueueSuccessSnackBar({
        message: t`Signed DPA generated and downloaded`,
      });
      navigateSettings(SettingsPath.LegalDpa);
    } catch {
      enqueueErrorSnackBar({
        message: t`Could not generate the signed DPA. Please try again.`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (previewLoading) {
    return <SettingsSkeletonLoader />;
  }

  return (
    <SettingsPageLayout
      title={t`Generate DPA`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        { children: t`Legal`, href: getSettingsPath(SettingsPath.LegalDpa) },
        { children: t`Generate` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isLoading={isGenerating}
          onCancel={() => navigateSettings(SettingsPath.LegalDpa)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        {preview?.notice && (
          <Section>
            <DpaNotice text={preview.notice} />
          </Section>
        )}

        <Section>
          <H2Title
            title={t`Your details`}
            description={t`The PDF is pre-signed by Twenty and executed with your legal entity and authorized signatory.`}
          />
          <SettingsTextInput
            instanceId="dpa-legal-entity-name"
            label={t`Legal entity name`}
            placeholder={t`Acme GmbH`}
            value={customerLegalEntityName}
            onChange={setCustomerLegalEntityName}
            fullWidth
          />
          <SettingsTextInput
            instanceId="dpa-signatory-name"
            label={t`Authorized signatory name`}
            placeholder={t`Jane Doe`}
            value={signatoryName}
            onChange={setSignatoryName}
            fullWidth
          />
          <SettingsTextInput
            instanceId="dpa-signatory-title"
            label={t`Signatory title`}
            placeholder={t`Head of Legal`}
            value={signatoryTitle}
            onChange={setSignatoryTitle}
            fullWidth
          />
        </Section>

        {preview && (
          <Section>
            <H2Title
              title={t`Preview`}
              description={t`The full agreement with fields resolved for your deployment.`}
            />
            <DpaDocumentPreview document={preview} />
          </Section>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
