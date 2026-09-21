import { Fragment, useId, useState } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { v4 as uuidv4 } from 'uuid';
import { IconSettings } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { IconButton } from 'twenty-ui/components';
import { Section } from 'twenty-ui/components';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Heading } from 'twenty-ui/primitives/typography';

import { currentUserState } from '@/auth/states/currentUserState';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import {
  MerchantCustomSettingFieldInput,
  StyledCustomSettingFieldCell,
  StyledCustomSettingFieldGrid,
  StyledCustomSettingFieldLabel,
} from '@/merchant/components/MerchantCustomSettingFieldInput';
import { MerchantCustomSettingToolCard } from '@/merchant/components/MerchantCustomSettingToolCard';
import {
  isCustomSettingToolEntry,
  type CustomSettingFieldSchemaEntry,
  type CustomSettingSchemaEntry,
  type CustomSettingToolRun,
  type CustomSettingToolSchemaEntry,
  type CustomSettingValue,
} from '@/merchant/types/CustomSettingSchema';
import {
  formatValueForInput,
  isCustomSettingToolRun,
  parseValueForSave,
} from '@/merchant/utils/customSettingValueTransforms';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { InputLabel } from 'twenty-ui/primitives/input';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { FileFolder } from '~/generated-metadata/graphql';

type MerchantCustomSettingsButtonProps = {
  recordId: string;
};

// The record side panel can mount this field (and thus this component) more
// than once. Modal and dropdown state in Twenty is global per instance id, so
// every id must be unique PER MOUNT — otherwise all mounted dialogs open at
// once and dropdown clicks land in whichever hidden twin rendered last.
const getModalInstanceId = (recordId: string, mountId: string) =>
  `merchant-custom-settings-modal-${recordId}-${mountId}`;

// Settings (form + Save) and tools (independent Run actions) are two different
// interaction models, so the modal splits them into tabs instead of one long
// scroll. The tab bar only renders when the app schema declares both kinds.
type CustomSettingsModalTab = 'settings' | 'tools';

const StyledTabBar = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledTabButton = styled.button`
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: -1px;
  padding: 0 0 ${themeCssVariables.spacing[2]};

  &[data-active='true'] {
    border-bottom-color: ${themeCssVariables.font.color.primary};
    color: ${themeCssVariables.font.color.primary};
  }
`;

// One vertical stack per tab so spacing stays even and the shared field grid
// keeps every label column aligned.
const StyledContentStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledDivider = styled.div`
  background: ${themeCssVariables.border.color.light};
  height: 1px;
  margin: ${themeCssVariables.spacing[2]} 0;
  width: 100%;
`;

const StyledFooter = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledModalContent = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 70dvh;
`;

const StyledScrollableSection = styled.div`
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: ${themeCssVariables.spacing[4]};
  scrollbar-color: ${themeCssVariables.border.color.medium} transparent;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${themeCssVariables.border.color.medium};
    border-radius: ${themeCssVariables.border.radius.pill};
  }
`;

export const MerchantCustomSettingsButton = ({
  recordId,
}: MerchantCustomSettingsButtonProps) => {
  const { t } = useLingui();
  const { openDialog, closeDialog } = useDialog();
  const mountId = useId();
  const modalInstanceId = getModalInstanceId(recordId, mountId);
  const currentUser = useAtomStateValue(currentUserState);

  const { record, refetch } = useFindOneRecord({
    objectNameSingular: 'merchant',
    objectRecordId: recordId,
    recordGqlFields: {
      id: true,
      customSettings: true,
      app: { id: true, fieldSchema: true },
    },
  });

  const fieldSchema = ((record?.app as { fieldSchema?: unknown } | null)
    ?.fieldSchema ?? []) as CustomSettingSchemaEntry[];
  const settingEntries = fieldSchema.filter(
    (entry): entry is CustomSettingFieldSchemaEntry =>
      !isCustomSettingToolEntry(entry),
  );
  const toolEntries = fieldSchema.filter(isCustomSettingToolEntry);
  const hasSettings = settingEntries.length > 0;
  const hasTools = toolEntries.length > 0;
  const hasSchema = hasSettings || hasTools;

  const { updateOneRecord } = useUpdateOneRecord();
  const { uploadFile } = useDirectFileUpload();

  const [schemaValues, setSchemaValues] = useState<
    Record<string, CustomSettingValue>
  >({});
  const [uploadingKeys, setUploadingKeys] = useState<Record<string, boolean>>(
    {},
  );
  const [runningToolKey, setRunningToolKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<CustomSettingsModalTab>('settings');

  const showTabBar = hasSettings && hasTools;
  // A tab is only reachable when its section exists in the schema — fall back
  // to the one section the app actually declares.
  const currentTab: CustomSettingsModalTab = !hasSettings
    ? 'tools'
    : !hasTools
      ? 'settings'
      : activeTab;

  // Portalled modal content (including the backdrop click-outside-to-close
  // area) still bubbles clicks up the REACT tree (not the DOM tree) to the
  // record field's own click-to-edit handler, which would otherwise flip the
  // underlying customSettings field into raw JSON edit mode every time this
  // modal is dismissed. Stopping propagation here, once, around the whole
  // modal wrapper, guards both the content and the backdrop beneath it.
  const stopClickPropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const currentCustomSettings = () =>
    (record?.customSettings as Record<string, unknown> | null) ?? {};

  const handleOpen = (event: React.MouseEvent) => {
    event.stopPropagation();

    const existingSettings = currentCustomSettings();

    const initialValues: Record<string, CustomSettingValue> = {};
    settingEntries.forEach((entry) => {
      initialValues[entry.key] = formatValueForInput(
        entry,
        existingSettings[entry.key] ?? entry.default,
      );
    });
    setSchemaValues(initialValues);
    setActiveTab('settings');
    openDialog(modalInstanceId);
  };

  const handleSchemaValueChange = (key: string, value: CustomSettingValue) => {
    setSchemaValues((previousValues) => ({ ...previousValues, [key]: value }));
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

      handleSchemaValueChange(key, {
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

  // Save only touches plain setting keys — tool keys hold run-envelopes owned
  // by the app behind the webhook, spreading the current object keeps them.
  const handleSave = async () => {
    const newCustomSettings = {
      ...currentCustomSettings(),
      ...Object.fromEntries(
        settingEntries.map((entry) => [
          entry.key,
          parseValueForSave(entry, schemaValues[entry.key]),
        ]),
      ),
    };

    await updateOneRecord({
      objectNameSingular: 'merchant',
      idToUpdate: recordId,
      updateOneRecordInput: { customSettings: newCustomSettings },
    });
    await refetch();
    closeDialog(modalInstanceId);
  };

  // Each Run writes a fresh envelope (new runId) under the tool's key; the app
  // deduplicates on runId so webhook replays never re-run the action.
  const handleRunTool = async (
    tool: CustomSettingToolSchemaEntry,
    params: Record<string, unknown>,
  ) => {
    setRunningToolKey(tool.key);
    try {
      const envelope: CustomSettingToolRun = {
        runId: uuidv4(),
        requestedAt: new Date().toISOString(),
        ...(isDefined(currentUser?.email) && {
          requestedBy: currentUser.email,
        }),
        status: 'REQUESTED',
        params,
      };

      await updateOneRecord({
        objectNameSingular: 'merchant',
        idToUpdate: recordId,
        updateOneRecordInput: {
          customSettings: { ...currentCustomSettings(), [tool.key]: envelope },
        },
      });
      await refetch();
    } finally {
      setRunningToolKey(null);
    }
  };

  return (
    <>
      <IconButton
        Icon={IconSettings}
        dataTestId="merchant-custom-settings-button"
        size="small"
        variant="secondary"
        accent="default"
        ariaLabel={t`Custom settings`}
        onClick={handleOpen}
      />
      <div onClick={stopClickPropagation} onMouseDown={stopClickPropagation}>
        <DialogInstance
          dialogId={modalInstanceId}
          dismissible
          renderInDocumentBody
        >
          {({ container, backdrop, viewportProps, onKeyDown }) => (
            <Dialog.Popup
              aria-label={t`Custom settings`}
              size="md"
              {...{ container, backdrop, viewportProps, onKeyDown }}
            >
              <StyledModalContent>
            <Heading level={1} size="lg">{t`Custom Settings`}</Heading>
            {showTabBar && (
              <StyledTabBar>
                <StyledTabButton
                  type="button"
                  data-active={currentTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                >
                  {t`Settings`}
                </StyledTabButton>
                <StyledTabButton
                  type="button"
                  data-active={currentTab === 'tools'}
                  onClick={() => setActiveTab('tools')}
                >
                  {t`Tools`}
                </StyledTabButton>
              </StyledTabBar>
            )}
            <StyledScrollableSection>
              <Section.Root align="center">
                {!hasSchema ? (
                  <InputLabel>
                    {t`No custom settings configured for this app.`}
                  </InputLabel>
                ) : currentTab === 'settings' ? (
                  <StyledContentStack>
                    <StyledCustomSettingFieldGrid>
                      {settingEntries.map((entry) => (
                        <Fragment key={entry.key}>
                          <StyledCustomSettingFieldLabel>
                            <InputLabel>{entry.label}</InputLabel>
                          </StyledCustomSettingFieldLabel>
                          <StyledCustomSettingFieldCell>
                            <MerchantCustomSettingFieldInput
                              entry={entry}
                              value={schemaValues[entry.key]}
                              instanceIdPrefix={`merchant-custom-setting-${mountId}`}
                              isUploading={uploadingKeys[entry.key]}
                              onChange={(value) =>
                                handleSchemaValueChange(entry.key, value)
                              }
                              onFileSelected={(file) =>
                                handleFileSelected(entry.key, file)
                              }
                            />
                          </StyledCustomSettingFieldCell>
                        </Fragment>
                      ))}
                    </StyledCustomSettingFieldGrid>
                  </StyledContentStack>
                ) : (
                  <StyledContentStack>
                    {toolEntries.map((tool, toolIndex) => {
                      const rawLastRun = currentCustomSettings()[tool.key];

                      return (
                        <Fragment key={tool.key}>
                          {toolIndex > 0 && <StyledDivider />}
                          <MerchantCustomSettingToolCard
                            instanceIdPrefix={`merchant-tool-${mountId}`}
                            tool={tool}
                            lastRun={
                              isCustomSettingToolRun(rawLastRun)
                                ? rawLastRun
                                : undefined
                            }
                            isRunning={runningToolKey === tool.key}
                            onRun={(params) => handleRunTool(tool, params)}
                          />
                        </Fragment>
                      );
                    })}
                  </StyledContentStack>
                )}
              </Section.Root>
            </StyledScrollableSection>
            <StyledFooter>
              {hasSchema && currentTab === 'settings' ? (
                <>
                  <Button
                    onClick={() => closeModal(modalInstanceId)}
                    title={t`Cancel`}
                    variant="secondary"
                    fullWidth
                  />
                  <Button
                    onClick={handleSave}
                    title={t`Save`}
                    variant="primary"
                    accent="blue"
                    fullWidth
                  />
                </>
              ) : (
                <Button
                  onClick={() => closeModal(modalInstanceId)}
                  title={t`Close`}
                  variant="secondary"
                />
              )}
            </StyledFooter>
            </StyledModalContent>
            </Dialog.Popup>
          )}
        </DialogInstance>
      </div>
    </>
  );
};
