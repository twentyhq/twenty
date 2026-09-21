import { Fragment, useState } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Tag, type TagColor } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import {
  MerchantCustomSettingFieldInput,
  StyledCustomSettingFieldCell,
  StyledCustomSettingFieldGrid,
  StyledCustomSettingFieldLabel,
} from '@/merchant/components/MerchantCustomSettingFieldInput';
import {
  type CustomSettingToolRun,
  type CustomSettingToolRunStatus,
  type CustomSettingToolSchemaEntry,
  type CustomSettingValue,
} from '@/merchant/types/CustomSettingSchema';
import {
  formatValueForInput,
  hasCustomSettingValue,
  parseValueForSave,
} from '@/merchant/utils/customSettingValueTransforms';
import { InputLabel } from 'twenty-ui/primitives/input';
import { isDefined } from 'twenty-shared/utils';
import { FileFolder } from '~/generated-metadata/graphql';

const TOOL_RUN_STATUS_COLOR: Record<CustomSettingToolRunStatus, TagColor> = {
  REQUESTED: 'blue',
  PROCESSING: 'orange',
  DONE: 'green',
  FAILED: 'red',
};

// No border box on purpose — a light horizontal inset is the only thing
// separating tools from the modal edge; rows share the settings grid template.
const StyledToolBlock = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: 0 ${themeCssVariables.spacing[2]};
  width: 100%;
`;

// Title + status tag grouped left, Run button on the same row to the right.
const StyledToolHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledToolTitleGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledToolTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLastRun = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type MerchantCustomSettingToolCardProps = {
  tool: CustomSettingToolSchemaEntry;
  // Must be unique per mounted parent — dropdown state is global per id.
  instanceIdPrefix: string;
  lastRun?: CustomSettingToolRun;
  isRunning: boolean;
  onRun: (params: Record<string, unknown>) => Promise<void>;
};

export const MerchantCustomSettingToolCard = ({
  tool,
  instanceIdPrefix,
  lastRun,
  isRunning,
  onRun,
}: MerchantCustomSettingToolCardProps) => {
  const { t } = useLingui();
  const { uploadFile } = useDirectFileUpload();

  const [paramValues, setParamValues] = useState<
    Record<string, CustomSettingValue>
  >(() => {
    const initialValues: Record<string, CustomSettingValue> = {};
    tool.fields.forEach((field) => {
      initialValues[field.key] = formatValueForInput(field, undefined);
    });
    return initialValues;
  });
  const [uploadingKeys, setUploadingKeys] = useState<Record<string, boolean>>(
    {},
  );

  const handleParamChange = (key: string, value: CustomSettingValue) => {
    setParamValues((previousValues) => ({ ...previousValues, [key]: value }));
  };

  const handleFileSelected = async (key: string, file: File | undefined) => {
    if (!isDefined(file)) {
      return;
    }

    setUploadingKeys((previousValues) => ({ ...previousValues, [key]: true }));

    try {
      const uploadedFile = await uploadFile(file, {
        fileFolder: FileFolder.MerchantCustomSetting,
      });

      handleParamChange(key, {
        fileId: uploadedFile.id,
        label: file.name,
        extension: uploadedFile.path.split('.').pop() ?? '',
        url: uploadedFile.url,
      });
    } finally {
      setUploadingKeys((previousValues) => ({
        ...previousValues,
        [key]: false,
      }));
    }
  };

  const isUploading = Object.values(uploadingKeys).some(Boolean);
  const hasMissingRequiredParam = tool.fields.some(
    (field) =>
      field.required === true &&
      !hasCustomSettingValue(field, paramValues[field.key]),
  );

  const handleRun = async () => {
    const params: Record<string, unknown> = {};
    tool.fields.forEach((field) => {
      const value = parseValueForSave(field, paramValues[field.key]);
      if (isDefined(value)) {
        params[field.key] = value;
      }
    });
    await onRun(params);
  };

  // Generic result rendering: prefer the app-authored one-line summary, fall
  // back to joining details as "key: value" — no tool-specific keys here.
  const lastRunResultText = isDefined(lastRun?.result)
    ? (lastRun.result.summary ??
      Object.entries(lastRun.result.details ?? {})
        .map(([key, detailValue]) => `${key}: ${detailValue}`)
        .join(' · '))
    : undefined;

  const lastRunText = isDefined(lastRun)
    ? [
        lastRun.requestedAt
          ? `${t`Last run`}: ${new Date(lastRun.requestedAt).toLocaleString(
              undefined,
              { dateStyle: 'short', timeStyle: 'short' },
            )}`
          : t`Last run`,
        lastRunResultText,
      ]
        .filter((part) => isDefined(part) && part.length > 0)
        .join(' · ')
    : undefined;

  return (
    <StyledToolBlock>
      <StyledToolHeader>
        <StyledToolTitleGroup>
          <StyledToolTitle>{tool.label}</StyledToolTitle>
          {isDefined(lastRun) && (
            <Tag
              text={lastRun.status}
              color={TOOL_RUN_STATUS_COLOR[lastRun.status] ?? 'gray'}
              weight="medium"
            />
          )}
        </StyledToolTitleGroup>
        <Button
          onClick={handleRun}
          title={isRunning ? t`Running...` : t`Run`}
          variant="primary"
          accent="blue"
          size="small"
          disabled={isRunning || isUploading || hasMissingRequiredParam}
        />
      </StyledToolHeader>
      <StyledCustomSettingFieldGrid>
        {tool.fields.map((field) => (
          <Fragment key={field.key}>
            <StyledCustomSettingFieldLabel>
              <InputLabel>{field.label}</InputLabel>
            </StyledCustomSettingFieldLabel>
            <StyledCustomSettingFieldCell>
              <MerchantCustomSettingFieldInput
                entry={field}
                value={paramValues[field.key]}
                instanceIdPrefix={`${instanceIdPrefix}-${tool.key}`}
                isUploading={uploadingKeys[field.key]}
                onChange={(value) => handleParamChange(field.key, value)}
                onFileSelected={(file) => handleFileSelected(field.key, file)}
              />
            </StyledCustomSettingFieldCell>
          </Fragment>
        ))}
      </StyledCustomSettingFieldGrid>
      {isDefined(lastRunText) && (
        <StyledLastRun title={lastRunText}>{lastRunText}</StyledLastRun>
      )}
    </StyledToolBlock>
  );
};
