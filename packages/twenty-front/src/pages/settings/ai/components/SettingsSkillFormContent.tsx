import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconInfoCircle, IconRefresh, useIcons } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { AppTooltip, Card, TooltipDelay } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { AI_INSTRUCTIONS_EDITOR_PROFILE } from '@/ai/constants/AiInstructionsEditorProfile';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import {
  CreateSkillDocument,
  type FindOneSkillQuery,
  UpdateSkillDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsSkillDangerZone } from '~/pages/settings/ai/components/SettingsSkillDangerZone';
import { type SettingsSkillFormValues } from '~/pages/settings/ai/types/SettingsSkillFormValues';
import { getSettingsAiBreadcrumbLinks } from '~/pages/settings/ai/utils/getSettingsAiBreadcrumbLinks';
import { getSettingsSkillInitialFormValues } from '~/pages/settings/ai/utils/getSettingsSkillInitialFormValues';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabel';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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

const StyledAdvancedSettingsOuterContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[4]};
`;

const StyledAdvancedSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

type SettingsSkillFormContentProps = {
  skill?: NonNullable<FindOneSkillQuery['skill']>;
};

export const SettingsSkillFormContent = ({
  skill,
}: SettingsSkillFormContentProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const navigate = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();

  const isCreateMode = !isDefined(skill);
  const isEditMode = isDefined(skill);
  const isReadonlyMode = isDefined(skill) && !skill.isCustom;

  const [initialFormValues] = useState(() =>
    getSettingsSkillInitialFormValues(skill),
  );
  const [formValues, setFormValues] = useState(initialFormValues);
  const [originalFormValues, setOriginalFormValues] =
    useState(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createSkill] = useMutation(CreateSkillDocument);
  const [updateSkill] = useMutation(UpdateSkillDocument);

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
  };

  const validateForm = (): boolean => {
    return (
      formValues.name.trim().length > 0 &&
      formValues.label.trim().length > 0 &&
      formValues.content.trim().length > 0
    );
  };

  const buildInput = () => ({
    name: formValues.name,
    label: formValues.label,
    description: formValues.description || undefined,
    content: formValues.content,
    icon: formValues.icon || undefined,
  });

  const autoSave = useDebouncedCallback(async () => {
    if (
      !isDefined(skill) ||
      isReadonlyMode ||
      !validateForm() ||
      isSubmitting
    ) {
      return;
    }

    if (isDeeplyEqual(formValues, originalFormValues)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateSkill({
        variables: {
          input: { id: skill.id, ...buildInput() },
        },
      });

      setOriginalFormValues({ ...formValues });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, 1_000);

  useEffect(() => {
    if (isEditMode) {
      autoSave();
    }
  }, [formValues, isEditMode, autoSave]);

  useEffect(() => {
    return () => {
      autoSave.flush();
    };
  }, [autoSave]);

  const canSave = !isReadonlyMode && validateForm() && !isSubmitting;

  const handleSave = async () => {
    if (isReadonlyMode || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isDefined(skill)) {
        await createSkill({
          variables: {
            input: buildInput(),
          },
        });
        navigate(SettingsPath.AI);
        return;
      }

      await updateSkill({
        variables: {
          input: { id: skill.id, ...buildInput() },
        },
      });

      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormValues(initialFormValues);
    navigate(SettingsPath.AI);
  };

  const breadcrumbText = isDefined(skill) ? skill.label : t`New Skill`;

  const isNameEditEnabled =
    !isReadonlyMode && !formValues.isLabelSyncedWithName;

  const apiNameTooltipText = formValues.isLabelSyncedWithName
    ? t`Deactivate "Synchronize Label and API Name" to set a custom API name`
    : t`Input must be in camel case and cannot start with a number`;

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
        <Section>
          <H2Title
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

            <AdvancedSettingsWrapper hideDot>
              <StyledAdvancedSettingsOuterContainer>
                <StyledAdvancedSettingsContainer>
                  <SettingsTextInput
                    instanceId="skill-api-name"
                    label={t`API Name`}
                    placeholder={t`mySkill`}
                    value={formValues.name}
                    onChange={(value) => handleFieldChange('name', value)}
                    disabled={!isNameEditEnabled}
                    fullWidth
                    RightIcon={() =>
                      apiNameTooltipText && (
                        <>
                          <IconInfoCircle
                            id="info-circle-id-skill-name"
                            size={theme.icon.size.md}
                            color={theme.font.color.tertiary}
                            style={{ outline: 'none' }}
                          />
                          <AppTooltip
                            anchorSelect="#info-circle-id-skill-name"
                            title={apiNameTooltipText}
                            offset={5}
                            noArrow
                            place="bottom"
                            positionStrategy="fixed"
                            delay={TooltipDelay.shortDelay}
                          />
                        </>
                      )
                    }
                  />
                  <Card rounded>
                    <SettingsOptionCardContentSwitch
                      Icon={IconRefresh}
                      title={t`Synchronize Label and API Name`}
                      description={t`Should changing the label also change the API name?`}
                      checked={formValues.isLabelSyncedWithName}
                      disabled={isReadonlyMode}
                      advancedMode
                      onChange={(value) =>
                        handleFieldChange('isLabelSyncedWithName', value)
                      }
                    />
                  </Card>
                </StyledAdvancedSettingsContainer>
              </StyledAdvancedSettingsOuterContainer>
            </AdvancedSettingsWrapper>
          </StyledFormContainer>
        </Section>

        {isDefined(skill) && <SettingsSkillDangerZone skill={skill} />}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
