import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconInfoCircle, IconRefresh, useIcons } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Card, Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { AI_INSTRUCTIONS_EDITOR_PROFILE } from '@/ai/constants/AiInstructionsEditorProfile';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { type FindOneSkillQuery } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsSkillDangerZone } from '~/pages/settings/ai/components/SettingsSkillDangerZone';
import { useSettingsSkillSave } from '~/pages/settings/ai/hooks/useSettingsSkillSave';
import { type SettingsSkillFormValues } from '~/pages/settings/ai/types/SettingsSkillFormValues';
import { getSettingsAiBreadcrumbLinks } from '~/pages/settings/ai/utils/getSettingsAiBreadcrumbLinks';
import { getSettingsSkillInitialFormValues } from '~/pages/settings/ai/utils/getSettingsSkillInitialFormValues';
import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledIconNameRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNameContainer = styled.div`
  flex: 1;
`;

const StyledApiNameInputContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[4]};
`;

type SettingsSkillFormContentProps = {
  skill?: NonNullable<FindOneSkillQuery['skill']>;
};

export const SettingsSkillFormContent = ({
  skill,
}: SettingsSkillFormContentProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const navigate = useNavigateSettings();

  const isCreateMode = !isDefined(skill);
  const isReadonlyMode = isDefined(skill) && !skill.isCustom;

  const [initialFormValues] = useState(() =>
    getSettingsSkillInitialFormValues(skill),
  );
  const [formValues, setFormValues] = useState(initialFormValues);

  const validateForm = (): boolean => {
    return (
      formValues.name.trim().length > 0 &&
      formValues.label.trim().length > 0 &&
      formValues.content.trim().length > 0
    );
  };

  const { handleSave, isSubmitting, scheduleAutoSave } = useSettingsSkillSave({
    skill,
    formValues,
    initialFormValues,
    isReadonlyMode,
    validateForm,
  });

  const handleFieldChange = <TField extends keyof SettingsSkillFormValues>(
    fieldName: TField,
    value: SettingsSkillFormValues[TField],
  ) => {
    setFormValues((previousValues) => {
      const newValues = { ...previousValues, [fieldName]: value };

      if (fieldName === 'label' && previousValues.isLabelSyncedWithName) {
        newValues.name = computeMetadataNameFromLabel(value as string);
      }

      if (fieldName === 'isLabelSyncedWithName' && value === true) {
        newValues.name = computeMetadataNameFromLabel(previousValues.label);
      }

      return newValues;
    });

    if (isDefined(skill)) {
      scheduleAutoSave();
    }
  };

  const canSave = !isReadonlyMode && validateForm() && !isSubmitting;

  const handleCancel = () => {
    setFormValues(initialFormValues);
    navigate(SettingsPath.AI);
  };

  const breadcrumbText = isDefined(skill) ? skill.label : t`New Skill`;

  const title = isCreateMode ? (
    t`New Skill`
  ) : (
    <SettingsEditableTitle
      instanceId="skill-label-input"
      disabled={isReadonlyMode}
      value={formValues.label}
      onChange={(value) => handleFieldChange('label', value)}
      placeholder={t`Skill name`}
    />
  );

  const SkillIcon = getIcon(formValues.icon || 'IconBook');

  return (
    <SettingsPageLayout
      title={title}
      icon={<SkillIcon size={theme.icon.size.md} color={theme.color.blue9} />}
      actionButton={
        isCreateMode ? (
          <SaveAndCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            isSaveDisabled={!canSave}
            isLoading={isSubmitting}
            isCancelDisabled={isSubmitting}
          />
        ) : undefined
      }
      links={getSettingsAiBreadcrumbLinks(breadcrumbText)}
    >
      <SettingsPageContainer>
        <Section.Root>
          <Section.Header
            title={t`About`}
            description={t`Define the name and instructions for this skill`}
          />
          <StyledFormContainer>
            <StyledIconNameRow>
              <IconPicker
                selectedIconKey={formValues.icon || 'IconBook'}
                onChange={({ iconKey }) => handleFieldChange('icon', iconKey)}
                disabled={isReadonlyMode}
              />
              <StyledNameContainer>
                <SettingsTextInput
                  instanceId="skill-label-field-input"
                  placeholder={t`Skill name`}
                  value={formValues.label}
                  onChange={(value) => handleFieldChange('label', value)}
                  disabled={isReadonlyMode}
                  fullWidth
                />
              </StyledNameContainer>
            </StyledIconNameRow>

            <TextArea
              textAreaId="skill-description-textarea"
              placeholder={t`Write a description`}
              minRows={3}
              maxRows={5}
              value={formValues.description}
              onChange={(value) =>
                handleFieldChange('description', value ?? '')
              }
              disabled={isReadonlyMode}
            />

            <FormAdvancedTextFieldInput
              label={t`Instructions`}
              readonly={isReadonlyMode}
              defaultValue={initialFormValues.content}
              profile={AI_INSTRUCTIONS_EDITOR_PROFILE}
              onChange={(content: string) =>
                handleFieldChange('content', content)
              }
              enableFullScreen={true}
              fullScreenBreadcrumbs={[
                {
                  children: formValues.label || t`Skill`,
                  href: '#',
                },
                {
                  children: t`Instructions Editor`,
                },
              ]}
              minHeight={300}
            />

            {!isReadonlyMode && (
              <div>
                <Card.Root>
                  <SettingsOptionCardContentSwitch
                    Icon={IconRefresh}
                    title={t`Synchronize Label and API Name`}
                    description={t`Should changing the label also change the API name?`}
                    checked={formValues.isLabelSyncedWithName}
                    onChange={(value) =>
                      handleFieldChange('isLabelSyncedWithName', value)
                    }
                  />
                </Card.Root>
                <Collapsible.Root open={!formValues.isLabelSyncedWithName}>
                  <Collapsible.Panel
                    dimension="height"
                    containAnimation={false}
                  >
                    <StyledApiNameInputContainer>
                      <SettingsTextInput
                        instanceId="skill-api-name"
                        label={t`API Name`}
                        placeholder={t`mySkill`}
                        value={formValues.name}
                        onChange={(value) => handleFieldChange('name', value)}
                        fullWidth
                        RightIcon={() => (
                          <Tooltip
                            content={t`Input must be in camel case and cannot start with a number`}
                            sideOffset={5}
                            side="bottom"
                            positionMethod="fixed"
                            delay={TooltipDelay.shortDelay}
                          >
                            <IconInfoCircle
                              id="info-circle-id-skill-name"
                              size={theme.icon.size.md}
                              color={theme.font.color.tertiary}
                              style={{ outline: 'none' }}
                            />
                          </Tooltip>
                        )}
                      />
                    </StyledApiNameInputContainer>
                  </Collapsible.Panel>
                </Collapsible.Root>
              </div>
            )}
          </StyledFormContainer>
        </Section.Root>

        {isDefined(skill) && <SettingsSkillDangerZone skill={skill} />}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
