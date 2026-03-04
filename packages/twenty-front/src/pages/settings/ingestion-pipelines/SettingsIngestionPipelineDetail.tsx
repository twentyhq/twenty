import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IngestionFieldMappingEditor } from '@/settings/ingestion-pipeline/components/IngestionFieldMappingEditor.component';
import { IngestionLogTable } from '@/settings/ingestion-pipeline/components/IngestionLogTable.component';
import { IngestionPipelineForm } from '@/settings/ingestion-pipeline/components/IngestionPipelineForm.component';
import { IngestionTestSection } from '@/settings/ingestion-pipeline/components/IngestionTestSection.component';
import { useIngestionFieldMappings } from '@/settings/ingestion-pipeline/hooks/useIngestionFieldMappings';
import { useIngestionPipeline } from '@/settings/ingestion-pipeline/hooks/useIngestionPipeline';
import { useIngestionPipelineLogs } from '@/settings/ingestion-pipeline/hooks/useIngestionPipelineLogs';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

const StyledDangerZone = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.danger};
  padding-top: ${themeCssVariables.spacing[4]};
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsIngestionPipelineDetail = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { pipelineId } = useParams<{ pipelineId: string }>();

  const { pipeline, loading, updatePipeline, deletePipeline, triggerPull } =
    useIngestionPipeline(pipelineId);
  const { mappings, createManyMappings, updateMapping, deleteMapping } =
    useIngestionFieldMappings(pipelineId);
  const { logs } = useIngestionPipelineLogs(pipelineId);

  if (loading || !pipeline) {
    return (
      <SubMenuTopBarContainer title={t`Loading...`} links={[]}>
        <SettingsPageContainer>
          <div>
            <Trans>Loading...</Trans>
          </div>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  const handleUpdate = async (values: {
    name: string;
    description?: string;
    mode: 'push' | 'pull';
    targetObjectNameSingular: string;
    sourceUrl?: string;
    schedule?: string;
    dedupFieldName?: string;
  }) => {
    await updatePipeline(pipeline.id, values);
  };

  const handleDelete = async () => {
    await deletePipeline(pipeline.id);
    navigate(getSettingsPath(SettingsPath.IngestionPipelines));
  };

  const handleTriggerPull = async () => {
    await triggerPull(pipeline.id);
  };

  const webhookUrl =
    pipeline.mode === 'push'
      ? `${window.location.origin}/ingestion/${pipeline.id}`
      : null;

  return (
    <SubMenuTopBarContainer
      title={pipeline.name}
      links={[
        { children: <Trans>Settings</Trans>, href: '/settings' },
        {
          children: <Trans>Ingestion Pipelines</Trans>,
          href: getSettingsPath(SettingsPath.IngestionPipelines),
        },
        { children: pipeline.name },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Pipeline Status`}
            description={t`Control whether this pipeline is active`}
          />
          <Card rounded>
            <SettingsOptionCardContentToggle
              title={t`Pipeline Enabled`}
              description={t`When enabled, this pipeline will accept incoming data and process records`}
              checked={pipeline.isEnabled}
              onChange={(value) =>
                updatePipeline(pipeline.id, { isEnabled: value })
              }
            />
          </Card>
        </Section>

        <Section>
          <H2Title
            title={t`Configuration`}
            description={t`Pipeline settings and source configuration`}
          />
          <IngestionPipelineForm
            pipeline={pipeline}
            webhookUrl={webhookUrl}
            onSubmit={handleUpdate}
          />
        </Section>

        <Section>
          <H2Title
            title={t`Field Mappings`}
            description={t`Map source fields to CRM fields`}
          />
          <IngestionFieldMappingEditor
            pipelineId={pipeline.id}
            targetObjectNameSingular={pipeline.targetObjectNameSingular}
            mappings={mappings}
            onSaveMappings={createManyMappings}
            onUpdateMapping={updateMapping}
            onDeleteMapping={deleteMapping}
          />
        </Section>

        <IngestionTestSection pipelineId={pipeline.id} />

        <Section>
          <H2Title
            title={t`Run History`}
            description={t`Recent pipeline execution logs`}
          />
          {pipeline.mode === 'pull' && (
            <StyledButtonRow>
              <Button
                title={t`Run Now`}
                variant="secondary"
                size="small"
                onClick={handleTriggerPull}
              />
            </StyledButtonRow>
          )}
          <IngestionLogTable logs={logs} />
        </Section>

        <Section>
          <StyledDangerZone>
            <H2Title
              title={t`Danger Zone`}
              description={t`Permanently delete this pipeline`}
            />
            <Button
              title={t`Delete Pipeline`}
              variant="secondary"
              accent="danger"
              onClick={handleDelete}
            />
          </StyledDangerZone>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
