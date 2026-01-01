import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  H2Title,
  IconInfoCircle,
  IconRefresh,
  TooltipDelay,
} from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import {
  useCreateSkillMutation,
  useSkillQuery,
  useUpdateSkillMutation,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabel';

import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-transform: uppercase;
`;

const StyledAdvancedSettingsOuterContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledAdvancedSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

type SkillFormValues = {
  name: string;
  label: string;
  description: string;
  content: string;
  icon: string;
  isLabelSyncedWithName: boolean;
};

const CONTENT_EDITOR_MIN_HEIGHT = 400;
const CONTENT_EDITOR_MAX_WIDTH = 700;

export const SettingsSkillForm = ({ mode }: { mode: 'create' | 'edit' }) => {
  const { skillId = '' } = useParams<{ skillId: string }>();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadonlyMode, setIsReadonlyMode] = useState(false);
  const [originalFormValues, setOriginalFormValues] =
    useState<SkillFormValues | null>(null);

  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const [formValues, setFormValues] = useState<SkillFormValues>({
    name: '',
    label: '',
    description: '',
    content: '',
    icon: 'IconSparkles',
    isLabelSyncedWithName: true,
  });

  const { data, loading } = useSkillQuery({
    variables: { id: skillId },
    skip: isCreateMode || !skillId,
    onCompleted: (data) => {
      const skill = data?.skill;
      if (isDefined(skill)) {
        if (!skill.isCustom) {
          setIsReadonlyMode(true);
        }
        const computedNameFromLabel = computeMetadataNameFromLabel(skill.label);
        const isLabelSyncedWithName = skill.name === computedNameFromLabel;

        const initialValues: SkillFormValues = {
          name: skill.name,
          label: skill.label,
          description: skill.description ?? '',
          content: skill.content,
          icon: skill.icon ?? 'IconSparkles',
          isLabelSyncedWithName,
        };
        setFormValues(initialValues);
        setOriginalFormValues(initialValues);
      } else {
        enqueueErrorSnackBar({
          message: t`Skill not found`,
        });
        navigateApp(AppPath.NotFound);
      }
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        apolloError: error,
      });
      navigateApp(AppPath.NotFound);
    },
  });

  const [createSkill] = useCreateSkillMutation();
  const [updateSkill] = useUpdateSkillMutation();

  const skill = data?.skill;

  const handleFieldChange = <K extends keyof SkillFormValues>(
    fieldName: K,
    value: SkillFormValues[K],
  ) => {
    setFormValues((prev) => {
      const newValues = { ...prev, [fieldName]: value };

      // If changing label and sync is enabled, also update name
      if (fieldName === 'label' && prev.isLabelSyncedWithName) {
        newValues.name = computeMetadataNameFromLabel(value as string);
      }

      // If enabling sync, update name from current label
      if (fieldName === 'isLabelSyncedWithName' && value === true) {
        newValues.name = computeMetadataNameFromLabel(prev.label);
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

  const autoSave = useDebouncedCallback(async () => {
    if (
      isCreateMode ||
      isReadonlyMode ||
      !validateForm() ||
      isSubmitting ||
      !skill
    ) {
      return;
    }

    const hasChanges =
      originalFormValues && !isDeeplyEqual(formValues, originalFormValues);

    if (!hasChanges) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateSkill({
        variables: {
          input: {
            id: skill.id,
            name: formValues.name,
            label: formValues.label,
            description: formValues.description || undefined,
            content: formValues.content,
            icon: formValues.icon || undefined,
          },
        },
      });

      setOriginalFormValues({ ...formValues });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, 1_000);

  useEffect(() => {
    if (isEditMode && !loading && isDefined(originalFormValues)) {
      autoSave();
    }
  }, [formValues, isEditMode, loading, originalFormValues, autoSave]);

  useEffect(() => {
    return () => {
      autoSave.flush();
    };
  }, [autoSave]);

  if (!isCreateMode && !loading && !skill) {
    return null;
  }

  const canSave = !isReadonlyMode && validateForm() && !isSubmitting;

  const handleSave = async () => {
    if (isReadonlyMode || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCreateMode) {
        await createSkill({
          variables: {
            input: {
              name: formValues.name,
              label: formValues.label,
              description: formValues.description || undefined,
              content: formValues.content,
              icon: formValues.icon || undefined,
            },
          },
        });
        navigate(SettingsPath.AI);
        return;
      }

      if (!skill) {
        return;
      }

      await updateSkill({
        variables: {
          input: {
            id: skill.id,
            name: formValues.name,
            label: formValues.label,
            description: formValues.description || undefined,
            content: formValues.content,
            icon: formValues.icon || undefined,
          },
        },
      });

      navigate(SettingsPath.AI);
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: error instanceof ApolloError ? error : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form values before navigating
    setFormValues({
      name: '',
      label: '',
      description: '',
      content: '',
      icon: 'IconSparkles',
      isLabelSyncedWithName: true,
    });
    navigate(SettingsPath.AI);
  };

  const title = !isCreateMode
    ? loading
      ? t`Skill`
      : skill?.label
    : t`New Skill`;
  const breadcrumbText = !isCreateMode
    ? loading
      ? t`Skill`
      : skill?.label
    : t`New Skill`;

  const isNameEditEnabled =
    !isReadonlyMode && !formValues.isLabelSyncedWithName;

  const apiNameTooltipText = formValues.isLabelSyncedWithName
    ? t`Deactivate "Synchronize Label and API Name" to set a custom API name`
    : t`Input must be in camel case and cannot start with a number`;

  return (
    <SubMenuTopBarContainer
      title={title}
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
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`AI`, href: getSettingsPath(SettingsPath.AI) },
        { children: breadcrumbText },
      ]}
    >
      <SettingsPageContainer>
        {isEditMode && loading ? (
          <Section>
            <Skeleton height={400} borderRadius={4} />
          </Section>
        ) : (
          <Section>
            <H2Title
              title={t`Skill Configuration`}
              description={t`Configure the skill label, description, and content.`}
            />
            <StyledInputsContainer>
              <StyledInputContainer>
                <StyledLabel>{t`Label`}</StyledLabel>
                <TextInput
                  placeholder={t`My Skill`}
                  value={formValues.label}
                  onChange={(value) => handleFieldChange('label', value)}
                  disabled={isReadonlyMode}
                  fullWidth
                />
              </StyledInputContainer>

              <StyledInputContainer>
                <StyledLabel>{t`Description`}</StyledLabel>
                <TextInput
                  placeholder={t`A brief description of what this skill does`}
                  value={formValues.description}
                  onChange={(value) => handleFieldChange('description', value)}
                  disabled={isReadonlyMode}
                  fullWidth
                />
              </StyledInputContainer>

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
                              content={apiNameTooltipText}
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
                      <SettingsOptionCardContentToggle
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

              <FormAdvancedTextFieldInput
                label={t`Content`}
                readonly={isReadonlyMode}
                defaultValue={formValues.content}
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
                    children: t`Content Editor`,
                  },
                ]}
                minHeight={CONTENT_EDITOR_MIN_HEIGHT}
                maxWidth={CONTENT_EDITOR_MAX_WIDTH}
              />
            </StyledInputsContainer>
          </Section>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
