import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from 'twenty-ui/layout';

import { type IngestionPipeline } from '@/settings/ingestion-pipeline/types/ingestion-pipeline.types';

type IngestionPipelineFormValues = {
  name: string;
  description?: string;
  mode: 'push' | 'pull';
  targetObjectNameSingular: string;
  sourceUrl?: string;
  schedule?: string;
  dedupFieldName?: string;
};

type IngestionPipelineFormProps = {
  pipeline?: IngestionPipeline | null;
  webhookUrl?: string | null;
  onSubmit: (values: IngestionPipelineFormValues) => Promise<void>;
};

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledModeButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue10
      : themeCssVariables.background.primary};
  cursor: pointer;
  text-align: center;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.color.blue
      : themeCssVariables.font.color.primary};
  transition: all 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledModeDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: normal;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledWebhookUrl = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-family: monospace;
  font-size: ${themeCssVariables.font.size.sm};
  word-break: break-all;
`;

const StyledButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing[2]};
`;

export const IngestionPipelineForm = ({
  pipeline,
  webhookUrl,
  onSubmit,
}: IngestionPipelineFormProps) => {
  const { t } = useLingui();
  const isEditing = !!pipeline;

  const [name, setName] = useState(pipeline?.name ?? '');
  const [description, setDescription] = useState(pipeline?.description ?? '');
  const [mode, setMode] = useState<'push' | 'pull'>(
    (pipeline?.mode as 'push' | 'pull') ?? 'push',
  );
  const [targetObject, setTargetObject] = useState(
    pipeline?.targetObjectNameSingular ?? '',
  );
  const [sourceUrl, setSourceUrl] = useState(pipeline?.sourceUrl ?? '');
  const [schedule, setSchedule] = useState(pipeline?.schedule ?? '');
  const [dedupFieldName, setDedupFieldName] = useState(
    pipeline?.dedupFieldName ?? '',
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        description: description || undefined,
        mode,
        targetObjectNameSingular: targetObject,
        sourceUrl: sourceUrl || undefined,
        schedule: schedule || undefined,
        dedupFieldName: dedupFieldName || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StyledForm>
      <TextInput
        label={t`Name`}
        placeholder={t`e.g. Convoso Leads Sync`}
        value={name}
        onChange={setName}
        fullWidth
      />

      <TextInput
        label={t`Description`}
        placeholder={t`Optional description`}
        value={description}
        onChange={setDescription}
        fullWidth
      />

      {!isEditing && (
        <Section>
          <H2Title
            title={t`Mode`}
            description={t`How data will enter the pipeline`}
          />
          <StyledRow>
            <StyledModeButton
              isActive={mode === 'push'}
              onClick={() => setMode('push')}
            >
              Push (Webhook)
              <StyledModeDescription>
                {t`External systems POST data to a webhook URL`}
              </StyledModeDescription>
            </StyledModeButton>
            <StyledModeButton
              isActive={mode === 'pull'}
              onClick={() => setMode('pull')}
            >
              Pull (Scheduled)
              <StyledModeDescription>
                {t`Fetch data from an external API on a schedule`}
              </StyledModeDescription>
            </StyledModeButton>
          </StyledRow>
        </Section>
      )}

      <TextInput
        label={t`Target Object`}
        placeholder={t`e.g. person, call, company`}
        value={targetObject}
        onChange={setTargetObject}
        fullWidth
        disabled={isEditing}
      />

      {webhookUrl && (
        <Section>
          <H2Title
            title={t`Webhook URL`}
            description={t`POST data to this URL to ingest records`}
          />
          <StyledWebhookUrl>{webhookUrl}</StyledWebhookUrl>
          {pipeline?.webhookSecret && (
            <TextInput
              label={t`Webhook Secret`}
              value={pipeline.webhookSecret}
              disabled
              fullWidth
            />
          )}
        </Section>
      )}

      {mode === 'pull' && (
        <>
          <TextInput
            label={t`Source URL`}
            placeholder={t`https://api.example.com/data`}
            value={sourceUrl}
            onChange={setSourceUrl}
            fullWidth
          />
          <TextInput
            label={t`Schedule (Cron)`}
            placeholder={t`*/5 * * * *`}
            value={schedule}
            onChange={setSchedule}
            fullWidth
          />
        </>
      )}

      <TextInput
        label={t`Dedup Field`}
        placeholder={t`e.g. phones.primaryPhoneNumber`}
        value={dedupFieldName}
        onChange={setDedupFieldName}
        fullWidth
      />

      <StyledButtonRow>
        <Button
          title={
            isEditing
              ? isSaving
                ? t`Saving...`
                : t`Save Changes`
              : isSaving
                ? t`Creating...`
                : t`Create Pipeline`
          }
          variant="primary"
          onClick={handleSubmit}
          disabled={!name || !targetObject || isSaving}
        />
      </StyledButtonRow>
    </StyledForm>
  );
};
