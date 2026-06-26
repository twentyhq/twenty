import { useMutation, useQuery } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Info } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { Card, CardContent } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { DpaDocumentPreview } from '@/settings/legal/components/DpaDocumentPreview';
import { GENERATE_SIGNED_DPA } from '@/settings/legal/graphql/mutations/generateSignedDpa';
import { GET_DPA_AGREEMENTS } from '@/settings/legal/graphql/queries/getDpaAgreements';
import { GET_DPA_PREVIEW } from '@/settings/legal/graphql/queries/getDpaPreview';
import {
  type DpaAgreement,
  type DpaDocument,
  type GenerateSignedDpaResult,
} from '@/settings/legal/types/Dpa';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { TextInput } from '@/ui/input/components/TextInput';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { beautifyExactDateTime } from '~/utils/date-utils';

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  max-width: 400px;
`;

const StyledButtonRow = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledRecordList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRecordMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

export const SettingsLegalDpa = () => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [customerLegalEntityName, setCustomerLegalEntityName] = useState('');
  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryTitle, setSignatoryTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: previewData } = useQuery<{ dpaPreview: DpaDocument }>(
    GET_DPA_PREVIEW,
  );
  const { data: agreementsData, refetch: refetchAgreements } = useQuery<{
    dpaAgreements: DpaAgreement[];
  }>(GET_DPA_AGREEMENTS);

  const [generateSignedDpa] = useMutation<{
    generateSignedDpa: GenerateSignedDpaResult;
  }>(GENERATE_SIGNED_DPA);

  const preview = previewData?.dpaPreview;
  const agreements = agreementsData?.dpaAgreements ?? [];

  const sccStatusLabel = preview?.sccSectionActive ? t`active` : t`dormant`;

  const deploymentInfo = preview
    ? t`Contracting Processor: ${preview.processorEntity} · Region: ${preview.region} · Template version ${preview.templateVersion} (last updated ${preview.lastUpdatedLabel}). International data-transfer (SCC) section is ${sccStatusLabel}. Sub-processors are listed at trust.twenty.com.`
    : '';

  const canGenerate =
    customerLegalEntityName.trim() !== '' &&
    signatoryName.trim() !== '' &&
    signatoryTitle.trim() !== '' &&
    !isGenerating;

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const { data } = await generateSignedDpa({
        variables: {
          input: { customerLegalEntityName, signatoryName, signatoryTitle },
        },
      });

      const result = data?.generateSignedDpa;

      if (!result) {
        throw new Error('No result returned');
      }

      await downloadFile(
        result.downloadUrl,
        `Twenty-DPA-${result.agreement.templateVersion}-${customerLegalEntityName}.pdf`,
      );

      enqueueSuccessSnackBar({
        message: t`Signed DPA generated and downloaded`,
      });

      await refetchAgreements();
    } catch {
      enqueueErrorSnackBar({
        message: t`Could not generate the signed DPA. Please try again.`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SettingsPageLayout
      title={t`Data Processing Agreement`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: <Trans>Legal</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Data Processing Agreement`}
            description={t`This DPA is incorporated into the Terms of Service and accepted at signup. The contracting entity, hosting region and governing law are determined automatically by your deployment.`}
          />
          {preview && <Info accent="blue" text={deploymentInfo} />}
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

        <Section>
          <H2Title
            title={t`Generate a signed copy`}
            description={t`Enter your legal entity and authorized signatory. The PDF is pre-signed by Twenty, executed with your details, and stored against this workspace.`}
          />
          <StyledForm>
            <TextInput
              label={t`Legal entity name`}
              value={customerLegalEntityName}
              onChange={setCustomerLegalEntityName}
              placeholder={t`Acme GmbH`}
              fullWidth
            />
            <TextInput
              label={t`Authorized signatory name`}
              value={signatoryName}
              onChange={setSignatoryName}
              placeholder={t`Jane Doe`}
              fullWidth
            />
            <TextInput
              label={t`Signatory title`}
              value={signatoryTitle}
              onChange={setSignatoryTitle}
              placeholder={t`Chief Executive Officer`}
              fullWidth
            />
            <StyledButtonRow>
              <Button
                title={t`Generate signed PDF`}
                variant="primary"
                accent="blue"
                disabled={!canGenerate}
                onClick={handleGenerate}
              />
            </StyledButtonRow>
          </StyledForm>
        </Section>

        {agreements.length > 0 && (
          <Section>
            <H2Title
              title={t`Executed copies`}
              description={t`Every accepted or signed DPA is recorded with its template version and timestamp.`}
            />
            <StyledRecordList>
              {agreements.map((agreement) => (
                <Card key={agreement.id} rounded>
                  <CardContent>
                    <div>
                      {agreement.type === 'SIGNED'
                        ? t`Signed copy`
                        : t`Click-through acceptance`}
                      {agreement.customerLegalEntityName
                        ? ` — ${agreement.customerLegalEntityName}`
                        : ''}
                    </div>
                    <StyledRecordMeta>
                      {t`Template version`} {agreement.templateVersion} ·{' '}
                      {agreement.processorEntity} ·{' '}
                      {beautifyExactDateTime(agreement.acceptedAt)}
                    </StyledRecordMeta>
                  </CardContent>
                </Card>
              ))}
            </StyledRecordList>
          </Section>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
