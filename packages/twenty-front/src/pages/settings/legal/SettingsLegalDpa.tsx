import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/typography';

import { DpaDeploymentInfo } from '@/settings/legal/components/DpaDeploymentInfo';
import { DpaDocumentPreview } from '@/settings/legal/components/DpaDocumentPreview';
import { SettingsDpaAgreementsTable } from '@/settings/legal/components/SettingsDpaAgreementsTable';
import { GET_DPA_AGREEMENTS } from '@/settings/legal/graphql/queries/getDpaAgreements';
import { GET_DPA_PREVIEW } from '@/settings/legal/graphql/queries/getDpaPreview';
import {
  type DpaAgreement,
  type DpaDocument,
} from '@/settings/legal/types/Dpa';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';

export const SettingsLegalDpa = () => {
  const { t } = useLingui();

  const { data: agreementsData } = useQuery<{ dpaAgreements: DpaAgreement[] }>(
    GET_DPA_AGREEMENTS,
  );
  const { data: previewData } = useQuery<{ dpaPreview: DpaDocument }>(
    GET_DPA_PREVIEW,
  );

  const agreements = agreementsData?.dpaAgreements ?? [];
  const preview = previewData?.dpaPreview;
  const hasAgreements = agreements.length > 0;

  return (
    <SettingsPageLayout
      title={t`Data Processing Agreement`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        { children: t`Legal` },
      ]}
      actionButton={
        <Button
          Icon={IconPlus}
          title={t`Generate DPA`}
          size="small"
          variant="secondary"
          to={getSettingsPath(SettingsPath.LegalDpaNew)}
        />
      }
    >
      <SettingsPageContainer>
        {hasAgreements ? (
          <Section>
            <H2Title
              title={t`Executed copies`}
              description={t`Accepted and signed DPAs for this workspace, with their template version and date.`}
            />
            <SettingsDpaAgreementsTable agreements={agreements} />
          </Section>
        ) : (
          preview && (
            <Section>
              <H2Title
                title={t`Data Processing Agreement`}
                description={t`No copy has been generated yet. This is the agreement that applies to your deployment — generate a signed copy from the top-right.`}
              />
              <DpaDeploymentInfo document={preview} />
              <DpaDocumentPreview document={preview} />
            </Section>
          )
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
