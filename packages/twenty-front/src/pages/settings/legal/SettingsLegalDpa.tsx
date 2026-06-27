import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { H2Title } from 'twenty-ui/typography';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { DpaDocumentPreview } from '@/settings/legal/components/DpaDocumentPreview';
import { DpaNotice } from '@/settings/legal/components/DpaNotice';
import { SettingsDpaAgreementsTable } from '@/settings/legal/components/SettingsDpaAgreementsTable';
import { GET_DPA_AGREEMENTS } from '@/settings/legal/graphql/queries/getDpaAgreements';
import { GET_DPA_PREVIEW } from '@/settings/legal/graphql/queries/getDpaPreview';
import {
  type DpaAgreement,
  type DpaDocument,
} from '@/settings/legal/types/Dpa';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';

export const SettingsLegalDpa = () => {
  const { t } = useLingui();
  // DPA queries are served by the core (/graphql) schema; the default Apollo
  // client targets /metadata, so the core client must be passed explicitly.
  const apolloCoreClient = useApolloCoreClient();

  const { data: agreementsData, loading: agreementsLoading } = useQuery<{
    dpaAgreements: DpaAgreement[];
  }>(GET_DPA_AGREEMENTS, { client: apolloCoreClient });

  const agreements = agreementsData?.dpaAgreements ?? [];
  const hasAgreements = agreements.length > 0;

  // The preview is only the empty-state fallback — skip the query (and its
  // server-side resolve) entirely once we know executed copies exist.
  const { data: previewData, error: previewError } = useQuery<{
    dpaPreview: DpaDocument;
  }>(GET_DPA_PREVIEW, {
    client: apolloCoreClient,
    skip: agreementsLoading || hasAgreements,
  });

  const preview = previewData?.dpaPreview;
  // Keep showing the skeleton until the preview has actually settled (data or
  // error) so there is no blank frame between agreements resolving empty and
  // the preview request starting.
  const isPreviewSettled = isDefined(previewData) || isDefined(previewError);
  const isLoading = agreementsLoading || (!hasAgreements && !isPreviewSettled);

  return (
    <SettingsPageLayout
      title={t`Data Processing Agreement`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.General) },
        { children: t`Legal` },
      ]}
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.LegalDpaNew)}>
          <Button
            Icon={IconPlus}
            title={t`Generate DPA`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
    >
      <SettingsPageContainer>
        {isLoading ? (
          <SettingsSkeletonLoader />
        ) : hasAgreements ? (
          <Section>
            <H2Title
              title={t`Executed copies`}
              description={t`Accepted and signed DPAs for this workspace, with their template version and date.`}
            />
            <SettingsDpaAgreementsTable agreements={agreements} />
          </Section>
        ) : preview ? (
          <>
            {preview.notice && (
              <Section>
                <DpaNotice text={preview.notice} />
              </Section>
            )}
            <Section>
              <H2Title
                title={t`Data Processing Agreement`}
                description={t`No copy has been generated yet. This is the agreement that applies to your deployment — generate a signed copy from the top-right.`}
              />
              <DpaDocumentPreview document={preview} />
            </Section>
          </>
        ) : (
          <Section>
            <DpaNotice
              text={t`The Data Processing Agreement could not be loaded. Please try again.`}
            />
          </Section>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
